// KARDASHEV M2h — stochastic weather Monte Carlo for the federated grid.
//
// Why this exists, and why it is not TypeScript.
//
// Every storage number in M2 (7.43 h to island, the 358 h seasonal cliff, the
// overbuild frontier) came from ONE deterministic weather year. Real reliability
// engineering never sizes a system that way: it computes a loss-of-load
// probability over a distribution of years. That means Monte Carlo, and Monte
// Carlo over (configs x samples x 8760 h x 5 clusters) is 10^9-10^11 region-hours.
// Single-threaded JS would take hours; this is one thread per synthetic year.
//
// Ported from src/lib/grid.ts. The port is only worth anything if it is exact,
// so the build has a hard validation gate: with variability switched off
// (clearness = 1, wind at its mean) this must reproduce the TypeScript
// deterministic result. See --validate.
//
// Target: sm_120 (RTX 5060 Ti, Blackwell). Build: native/mc-grid/build.cmd

#define _USE_MATH_DEFINES
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cmath>
#include <vector>
#include <algorithm>
#include <cuda_runtime.h>

// MSVC does not define M_PI without _USE_MATH_DEFINES, and nvcc's device pass
// does not see it either. Own constant, no platform guessing.
#ifndef KPI
#define KPI 3.14159265358979323846
#endif

#define CUDA_OK(x)                                                                       \
  do {                                                                                   \
    cudaError_t e_ = (x);                                                                \
    if (e_ != cudaSuccess) {                                                             \
      std::fprintf(stderr, "CUDA %s at %s:%d\n", cudaGetErrorString(e_), __FILE__,       \
                   __LINE__);                                                            \
      std::exit(1);                                                                      \
    }                                                                                    \
  } while (0)

// ─────────────────────────────────────────── constants, mirroring src/lib/grid.ts

#define N_REGIONS 5
#define HOURS_PER_YEAR 8760

__constant__ double d_lat[N_REGIONS];
__constant__ double d_lon[N_REGIONS];
__constant__ double d_meanLoadW[N_REGIONS];
__constant__ double d_solarPeakW[N_REGIONS];   // already divided by SOLAR_CF
__constant__ double d_windW[N_REGIONS];        // flat delivered power at mean CF
__constant__ double d_firmW[N_REGIONS];
__constant__ double d_annualInsol[N_REGIONS];  // normalization, computed on host
__constant__ double d_loadSeasonMean[N_REGIONS];

__constant__ double d_obliquity;
__constant__ double d_loadSwing;
__constant__ double d_loadPeakHour;
__constant__ double d_windWinterBoost;
__constant__ double d_winterSolsticeDay;
__constant__ double d_etaLeg;
__constant__ double d_cRateH;
__constant__ double d_heatElectrification;
__constant__ double d_windMeanCf;

// Stochastic weather parameters.
__constant__ double d_windPhi;     // OU persistence per hour
__constant__ double d_windSigma;   // absolute std of the wind capacity factor
__constant__ double d_cloudPhi;
__constant__ double d_clearMean;   // mean clearness index
__constant__ double d_clearSigma;
__constant__ double d_windSolarRho;

// ────────────────────────────────────────────────────────────── device helpers

__device__ __forceinline__ double localHour(double hourUtc, double lon) {
  double h = fmod(hourUtc + lon / 15.0, 24.0);
  if (h < 0.0) h += 24.0;
  return h;
}

__device__ __forceinline__ double solarDeclDeg(double day) {
  return d_obliquity * sin(2.0 * KPI * (day - 81.0) / 365.25);
}

__device__ __forceinline__ double sunriseHourAngleDeg(double latDeg, double declDeg) {
  const double rad = KPI / 180.0;
  double c = -tan(latDeg * rad) * tan(declDeg * rad);
  c = fmin(1.0, fmax(-1.0, c));
  return acos(c) / rad;
}

__device__ __forceinline__ double dailyInsolationFactor(double latDeg, double day) {
  const double rad = KPI / 180.0;
  double la = latDeg * rad;
  double dd = solarDeclDeg(day) * rad;
  double ws = sunriseHourAngleDeg(latDeg, solarDeclDeg(day)) * rad;
  double h = ws * sin(la) * sin(dd) + cos(la) * cos(dd) * sin(ws);
  double eq = cos(la);
  return eq > 1e-9 ? fmax(0.0, h / eq) : 0.0;
}

// Matches solarFactorGeo(hourUtc, lat, lon, day, normalized = true).
__device__ __forceinline__ double solarFactorGeo(double hourUtc, int r, double day) {
  double lat = d_lat[r];
  double ws = sunriseHourAngleDeg(lat, solarDeclDeg(day));
  double daylight = 2.0 * ws / 15.0;
  if (daylight <= 0.0) return 0.0;
  double sunrise = 12.0 - ws / 15.0;
  double h = localHour(hourUtc, d_lon[r]);
  if (h <= sunrise || h >= sunrise + daylight) return 0.0;
  double season = dailyInsolationFactor(lat, day) / d_annualInsol[r];
  double amplitude = (12.0 * season) / daylight;
  return amplitude * sin(KPI * (h - sunrise) / daylight);
}

__device__ __forceinline__ double loadFactor(double hourUtc, double lon) {
  double h = localHour(hourUtc, lon);
  return 1.0 + d_loadSwing * cos(2.0 * KPI * (h - d_loadPeakHour) / 24.0);
}

__device__ __forceinline__ double windSeasonFactor(double latDeg, double day) {
  const double rad = KPI / 180.0;
  return 1.0 + d_windWinterBoost * sin(latDeg * rad) *
                   cos(2.0 * KPI * (day - d_winterSolsticeDay) / 365.25);
}

// Matches rawLoadSeason(); the annual mean is divided out on the host side.
__device__ __forceinline__ double rawLoadSeason(double latDeg, double day) {
  const double rad = KPI / 180.0;
  double w = cos(2.0 * KPI * (day - d_winterSolsticeDay) / 365.25) * (latDeg < 0.0 ? -1.0 : 1.0);
  double heatRatio = 1.2 + d_heatElectrification * (2.0 - 1.2);
  double C_EQ = 1.0 / cos(15.0 * rad);
  double aCool = (1.15 - 1.0) / C_EQ;
  double C50 = cos(50.0 * rad) / cos(15.0 * rad);
  double aHeat = heatRatio - 1.0 + heatRatio * C50 * aCool;
  double heat = fmax(0.0, w) * (fabs(sin(latDeg * rad)) / sin(50.0 * rad));
  double cool = fmax(0.0, -w) * (cos(latDeg * rad) / cos(15.0 * rad));
  return 1.0 + aHeat * heat + aCool * cool;
}

// ───────────────────────────────────────────────────────────────── RNG (xoshiro)

struct Rng {
  unsigned long long s0, s1;
};

__device__ __forceinline__ unsigned long long rotl(unsigned long long x, int k) {
  return (x << k) | (x >> (64 - k));
}

__device__ __forceinline__ unsigned long long nextU64(Rng &r) {
  unsigned long long s0 = r.s0, s1 = r.s1;
  unsigned long long result = s0 + s1;
  s1 ^= s0;
  r.s0 = rotl(s0, 55) ^ s1 ^ (s1 << 14);
  r.s1 = rotl(s1, 36);
  return result;
}

__device__ __forceinline__ double uniform01(Rng &r) {
  return (double)(nextU64(r) >> 11) * (1.0 / 9007199254740992.0);
}

// Box-Muller in FP32, on purpose.
//
// [OPTIMIZATION] The weather perturbation is a stochastic INPUT with sigma
// ~0.25 - it carries no precision worth protecting. Generating it in FP64 on a
// consumer Blackwell part, where FP64 runs at 1/64 rate, made log/sin/cos the
// entire remaining cost of the kernel. Energy accumulators stay double, because
// those DO accumulate over 8760 hours. Precision where it compounds, speed
// where it is noise.
__device__ __forceinline__ float uniform01f(Rng &r) {
  return (float)(nextU64(r) >> 40) * (1.0f / 16777216.0f);
}

__device__ __forceinline__ void normal2(Rng &r, float &z0, float &z1) {
  float u1 = fmaxf(1e-7f, uniform01f(r));
  float u2 = uniform01f(r);
  float m = sqrtf(-2.0f * __logf(u1));
  float sn, cs;
  __sincosf(6.2831853f * u2, &sn, &cs);
  z0 = m * cs;
  z1 = m * sn;
}

__device__ __forceinline__ void seedRng(Rng &r, unsigned long long seed) {
  // splitmix64 to spread a thread index into a decent state.
  unsigned long long z = seed + 0x9E3779B97F4A7C15ULL;
  z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9ULL;
  z = (z ^ (z >> 27)) * 0x94D049BB133111EBULL;
  r.s0 = z ^ (z >> 31);
  z = r.s0 + 0x9E3779B97F4A7C15ULL;
  z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9ULL;
  z = (z ^ (z >> 27)) * 0x94D049BB133111EBULL;
  r.s1 = z ^ (z >> 31);
  if (r.s0 == 0 && r.s1 == 0) r.s1 = 1;
}

// ───────────────────────────────────────────────── precomputed hourly tables
//
// [OPTIMIZATION] The solar shape, the load shape and the wind seasonality are
// functions of (hour, region) ONLY. They do not depend on the sample or on the
// configuration, so recomputing them inside every thread evaluated the same
// ~10 transcendentals 240,000 times over. On a consumer Blackwell part FP64
// runs at 1/64 rate, which made that the whole cost of the kernel.
//
// Hoisted to a host-side table of 8760 x 5. Threads in a warp sit at the same
// hour, so every read is a broadcast out of L2.

// ─────────────────────────────────────────────────────────────────── the kernel

// One thread simulates one synthetic weather year for one configuration.
// Islanded: no inter-cluster trade, matching noTradeAllocator, which is the
// condition the storage sizing is defined under.
__global__ void mcYear(const double *storageHours, const double *overbuild, int nConfig,
                       int nSample, unsigned long long baseSeed, int stochastic,
                       const double *__restrict__ tblSolar,
                       const double *__restrict__ tblLoad,
                       const double *__restrict__ tblWindSeason,
                       double *outUnservedFrac) {
  int gid = blockIdx.x * blockDim.x + threadIdx.x;
  if (gid >= nConfig * nSample) return;
  int cfg = gid / nSample;
  (void)(gid - cfg * nSample);  // sample index folded into the seed

  double sh = storageHours[cfg];
  double ob = overbuild[cfg];

  Rng rng;
  seedRng(rng, baseSeed + (unsigned long long)gid * 0x2545F4914F6CDD1DULL);

  double soc[N_REGIONS];
  double capJ[N_REGIONS];
  double powW[N_REGIONS];
  float windZ[N_REGIONS];
  float cloudZ[N_REGIONS];

  for (int r = 0; r < N_REGIONS; ++r) {
    capJ[r] = d_meanLoadW[r] * sh * 3600.0;
    powW[r] = (d_meanLoadW[r] * sh) / d_cRateH;
    soc[r] = capJ[r] * 0.5;
    float z0, z1;
    normal2(rng, z0, z1);
    windZ[r] = z0;
    cloudZ[r] = z1;
  }

  double totalLoadJ = 0.0;
  double totalUnservedJ = 0.0;

  for (int h = 0; h < HOURS_PER_YEAR; ++h) {
    for (int r = 0; r < N_REGIONS; ++r) {
      int t = h * N_REGIONS + r;
      // Stochastic weather: two correlated OU processes per cluster. Clusters
      // are independent of each other, which is justified — wind-power spatial
      // correlation e-folds at ~600 km and these hubs are 6,300-14,900 km apart.
      double windCf = d_windMeanCf;
      double clearness = 1.0;
      if (stochastic) {
        float e0, e1;
        normal2(rng, e0, e1);
        float rho = (float)d_windSolarRho;
        float eCorr = rho * e0 + sqrtf(fmaxf(0.0f, 1.0f - rho * rho)) * e1;
        float wPhi = (float)d_windPhi, cPhi = (float)d_cloudPhi;
        windZ[r] = wPhi * windZ[r] + sqrtf(fmaxf(0.0f, 1.0f - wPhi * wPhi)) * e0;
        cloudZ[r] = cPhi * cloudZ[r] + sqrtf(fmaxf(0.0f, 1.0f - cPhi * cPhi)) * eCorr;
        windCf = fmin(1.0, fmax(0.0, d_windMeanCf + d_windSigma * windZ[r]));
        clearness = fmin(1.0, fmax(0.0, d_clearMean + d_clearSigma * cloudZ[r])) / d_clearMean;
      }

      double loadW = d_meanLoadW[r] * tblLoad[t];
      double solarW = d_solarPeakW[r] * ob * tblSolar[t] * clearness;
      double windPow = d_windW[r] * ob * tblWindSeason[t] * (windCf / d_windMeanCf);
      double variable = solarW + windPow;
      double firm = fmin(d_firmW[r] * ob, fmax(0.0, loadW - variable));
      double net = variable + firm - loadW;

      if (net > 0.0) {
        double headroomW = (capJ[r] - soc[r]) / 3600.0 / d_etaLeg;
        double chargeW = fmax(0.0, fmin(fmin(net, powW[r]), headroomW));
        soc[r] = fmin(capJ[r], soc[r] + chargeW * d_etaLeg * 3600.0);
        net -= chargeW;
      } else if (net < 0.0) {
        double availW = (soc[r] / 3600.0) * d_etaLeg;
        double dischargeW = fmax(0.0, fmin(fmin(-net, powW[r]), availW));
        soc[r] = fmax(0.0, soc[r] - (dischargeW / d_etaLeg) * 3600.0);
        net += dischargeW;
      }

      totalLoadJ += loadW * 3600.0;
      if (net < 0.0) totalUnservedJ += (-net) * 3600.0;
    }
  }

  outUnservedFrac[gid] = totalLoadJ > 0.0 ? totalUnservedJ / totalLoadJ : 0.0;
}

// ───────────────────────────────────────────────────────────────────────── host

struct RegionCpu {
  const char *id;
  double lat, lon, loadShare, solarShare, windShare, firmShare;
};

// Mirrors REGIONS in src/lib/grid.ts exactly.
static RegionCpu REGIONS[N_REGIONS] = {
    {"NA", 39.8, -98.6, 0.19, 0.45, 0.35, 0.35},
    {"SA", -15.8, -47.9, 0.08, 0.35, 0.20, 0.60},
    {"EU", 50.1, 8.7, 0.16, 0.35, 0.45, 0.35},
    {"AF", -1.3, 36.8, 0.11, 0.75, 0.15, 0.25},
    {"AP", 1.35, 103.8, 0.46, 0.55, 0.20, 0.40},
};

static const double SECONDS_PER_YEAR = 365.25 * 86400.0;
static const double ELECTRICITY_W = 30000.0 * 1e12 * 3600.0 / SECONDS_PER_YEAR;
static const double SOLAR_CF = 1.0 / KPI;
static const double WIND_CF = 0.35;
static const double OBLIQUITY = 23.44;
static const double WINTER_SOLSTICE_DAY = 355.0;

static double hostDecl(double day) { return OBLIQUITY * sin(2.0 * KPI * (day - 81.0) / 365.25); }

static double hostDailyInsolation(double latDeg, double day) {
  const double rad = KPI / 180.0;
  double la = latDeg * rad, dd = hostDecl(day) * rad;
  double c = -tan(la) * tan(dd);
  c = std::min(1.0, std::max(-1.0, c));
  double ws = acos(c);
  double h = ws * sin(la) * sin(dd) + cos(la) * cos(dd) * sin(ws);
  double eq = cos(la);
  return eq > 1e-9 ? std::max(0.0, h / eq) : 0.0;
}

static double hostRawLoadSeason(double latDeg, double day, double he) {
  const double rad = KPI / 180.0;
  double w = cos(2.0 * KPI * (day - WINTER_SOLSTICE_DAY) / 365.25) * (latDeg < 0.0 ? -1.0 : 1.0);
  double heatRatio = 1.2 + he * (2.0 - 1.2);
  double C_EQ = 1.0 / cos(15.0 * rad);
  double aCool = (1.15 - 1.0) / C_EQ;
  double C50 = cos(50.0 * rad) / cos(15.0 * rad);
  double aHeat = heatRatio - 1.0 + heatRatio * C50 * aCool;
  double heat = std::max(0.0, w) * (fabs(sin(latDeg * rad)) / sin(50.0 * rad));
  double cool = std::max(0.0, -w) * (cos(latDeg * rad) / cos(15.0 * rad));
  return 1.0 + aHeat * heat + aCool * cool;
}

int main(int argc, char **argv) {
  int nSample = 2000;
  int stochastic = 1;
  double he = 0.0;
  double rho = 0.0;
  double windSigma = 0.25;
  double clearSigma = 0.18;
  unsigned long long seed = 20260825ULL;
  const char *mode = "sweep";

  for (int i = 1; i < argc; ++i) {
    if (!strcmp(argv[i], "--validate")) { mode = "validate"; stochastic = 0; nSample = 1; }
    else if (!strcmp(argv[i], "--samples") && i + 1 < argc) nSample = atoi(argv[++i]);
    else if (!strcmp(argv[i], "--heat") && i + 1 < argc) he = atof(argv[++i]);
    else if (!strcmp(argv[i], "--rho") && i + 1 < argc) rho = atof(argv[++i]);
    else if (!strcmp(argv[i], "--windsigma") && i + 1 < argc) windSigma = atof(argv[++i]);
    else if (!strcmp(argv[i], "--seed") && i + 1 < argc) seed = strtoull(argv[++i], nullptr, 10);
    else if (!strcmp(argv[i], "--deterministic")) stochastic = 0;
  }

  double lat[N_REGIONS], lon[N_REGIONS], meanLoad[N_REGIONS], solarPeak[N_REGIONS];
  double windW[N_REGIONS], firmW[N_REGIONS], annualInsol[N_REGIONS], loadSeasonMean[N_REGIONS];
  for (int r = 0; r < N_REGIONS; ++r) {
    lat[r] = REGIONS[r].lat;
    lon[r] = REGIONS[r].lon;
    meanLoad[r] = ELECTRICITY_W * REGIONS[r].loadShare;
    solarPeak[r] = meanLoad[r] * REGIONS[r].solarShare / SOLAR_CF;
    windW[r] = meanLoad[r] * REGIONS[r].windShare;
    firmW[r] = meanLoad[r] * REGIONS[r].firmShare;
    double si = 0.0, sl = 0.0;
    for (int d = 1; d <= 365; ++d) {
      si += hostDailyInsolation(lat[r], (double)d);
      sl += hostRawLoadSeason(lat[r], (double)d, he);
    }
    annualInsol[r] = si / 365.0;
    loadSeasonMean[r] = sl / 365.0;
  }

  double etaLeg = sqrt(0.9), cRate = 4.0, loadSwing = 0.22, peakHour = 19.0, boost = 0.30;
  double windPhi = exp(-1.0 / 40.0);   // ~40 h synoptic e-folding for wind
  double cloudPhi = exp(-1.0 / 24.0);  // ~1 day for cloud
  double clearMean = 0.60;

  CUDA_OK(cudaMemcpyToSymbol(d_lat, lat, sizeof(lat)));
  CUDA_OK(cudaMemcpyToSymbol(d_lon, lon, sizeof(lon)));
  CUDA_OK(cudaMemcpyToSymbol(d_meanLoadW, meanLoad, sizeof(meanLoad)));
  CUDA_OK(cudaMemcpyToSymbol(d_solarPeakW, solarPeak, sizeof(solarPeak)));
  CUDA_OK(cudaMemcpyToSymbol(d_windW, windW, sizeof(windW)));
  CUDA_OK(cudaMemcpyToSymbol(d_firmW, firmW, sizeof(firmW)));
  CUDA_OK(cudaMemcpyToSymbol(d_annualInsol, annualInsol, sizeof(annualInsol)));
  CUDA_OK(cudaMemcpyToSymbol(d_loadSeasonMean, loadSeasonMean, sizeof(loadSeasonMean)));
  CUDA_OK(cudaMemcpyToSymbol(d_obliquity, &OBLIQUITY, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_loadSwing, &loadSwing, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_loadPeakHour, &peakHour, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_windWinterBoost, &boost, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_winterSolsticeDay, &WINTER_SOLSTICE_DAY, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_etaLeg, &etaLeg, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_cRateH, &cRate, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_heatElectrification, &he, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_windMeanCf, &WIND_CF, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_windPhi, &windPhi, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_windSigma, &windSigma, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_cloudPhi, &cloudPhi, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_clearMean, &clearMean, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_clearSigma, &clearSigma, sizeof(double)));
  CUDA_OK(cudaMemcpyToSymbol(d_windSolarRho, &rho, sizeof(double)));

  // Hourly tables: solar shape, normalized load shape, wind seasonality.
  std::vector<double> hSolar((size_t)HOURS_PER_YEAR * N_REGIONS);
  std::vector<double> hLoad((size_t)HOURS_PER_YEAR * N_REGIONS);
  std::vector<double> hWind((size_t)HOURS_PER_YEAR * N_REGIONS);
  for (int h = 0; h < HOURS_PER_YEAR; ++h) {
    double day = (double)(1 + (h / 24) % 365);
    for (int r = 0; r < N_REGIONS; ++r) {
      size_t t = (size_t)h * N_REGIONS + r;
      double la = lat[r], lo = lon[r];
      double lh = fmod((double)h + lo / 15.0, 24.0);
      if (lh < 0.0) lh += 24.0;
      // solar
      double c = -tan(la * KPI / 180.0) * tan(hostDecl(day) * KPI / 180.0);
      c = std::min(1.0, std::max(-1.0, c));
      double ws = acos(c) / (KPI / 180.0);
      double daylight = 2.0 * ws / 15.0;
      double sunrise = 12.0 - ws / 15.0;
      double shape = 0.0;
      if (daylight > 0.0 && lh > sunrise && lh < sunrise + daylight) {
        double season = hostDailyInsolation(la, day) / annualInsol[r];
        shape = (12.0 * season / daylight) * sin(KPI * (lh - sunrise) / daylight);
      }
      hSolar[t] = shape;
      // load: diurnal x seasonal, normalized
      double diurnal = 1.0 + loadSwing * cos(2.0 * KPI * (lh - peakHour) / 24.0);
      hLoad[t] = diurnal * (hostRawLoadSeason(la, day, he) / loadSeasonMean[r]);
      // wind seasonality
      hWind[t] = 1.0 + boost * sin(la * KPI / 180.0) *
                           cos(2.0 * KPI * (day - WINTER_SOLSTICE_DAY) / 365.25);
    }
  }
  double *dSolar, *dLoad, *dWind;
  size_t tblBytes = (size_t)HOURS_PER_YEAR * N_REGIONS * sizeof(double);
  CUDA_OK(cudaMalloc(&dSolar, tblBytes));
  CUDA_OK(cudaMalloc(&dLoad, tblBytes));
  CUDA_OK(cudaMalloc(&dWind, tblBytes));
  CUDA_OK(cudaMemcpy(dSolar, hSolar.data(), tblBytes, cudaMemcpyHostToDevice));
  CUDA_OK(cudaMemcpy(dLoad, hLoad.data(), tblBytes, cudaMemcpyHostToDevice));
  CUDA_OK(cudaMemcpy(dWind, hWind.data(), tblBytes, cudaMemcpyHostToDevice));

  std::vector<double> sh, ob;
  if (!strcmp(mode, "validate")) {
    const double shs[] = {4.0, 7.43, 100.0, 400.0};
    for (double s : shs) { sh.push_back(s); ob.push_back(1.0); }
    for (double o : {1.0, 1.15, 1.5, 2.0}) { sh.push_back(7.43); ob.push_back(o); }
  } else {
    for (double o : {1.0, 1.15, 1.3, 1.5, 1.75, 2.0}) {
      for (double s : {2.0, 4.0, 6.0, 8.0, 12.0, 24.0, 48.0, 96.0, 200.0, 400.0}) {
        sh.push_back(s);
        ob.push_back(o);
      }
    }
  }
  int nConfig = (int)sh.size();

  double *dSh, *dOb, *dOut;
  CUDA_OK(cudaMalloc(&dSh, nConfig * sizeof(double)));
  CUDA_OK(cudaMalloc(&dOb, nConfig * sizeof(double)));
  CUDA_OK(cudaMalloc(&dOut, (size_t)nConfig * nSample * sizeof(double)));
  CUDA_OK(cudaMemcpy(dSh, sh.data(), nConfig * sizeof(double), cudaMemcpyHostToDevice));
  CUDA_OK(cudaMemcpy(dOb, ob.data(), nConfig * sizeof(double), cudaMemcpyHostToDevice));

  int total = nConfig * nSample;
  int threads = 128;
  int blocks = (total + threads - 1) / threads;

  cudaEvent_t t0, t1;
  CUDA_OK(cudaEventCreate(&t0));
  CUDA_OK(cudaEventCreate(&t1));
  CUDA_OK(cudaEventRecord(t0));
  mcYear<<<blocks, threads>>>(dSh, dOb, nConfig, nSample, seed, stochastic, dSolar, dLoad,
                              dWind, dOut);
  CUDA_OK(cudaGetLastError());
  CUDA_OK(cudaEventRecord(t1));
  CUDA_OK(cudaDeviceSynchronize());
  float ms = 0.0f;
  CUDA_OK(cudaEventElapsedTime(&ms, t0, t1));

  std::vector<double> out((size_t)total);
  CUDA_OK(cudaMemcpy(out.data(), dOut, (size_t)total * sizeof(double), cudaMemcpyDeviceToHost));

  std::printf("{\n");
  std::printf("  \"mode\": \"%s\",\n", mode);
  std::printf("  \"samples\": %d,\n", nSample);
  std::printf("  \"configs\": %d,\n", nConfig);
  std::printf("  \"stochastic\": %d,\n", stochastic);
  std::printf("  \"heatElectrification\": %g,\n", he);
  std::printf("  \"windSolarRho\": %g,\n", rho);
  std::printf("  \"windSigma\": %g,\n", windSigma);
  std::printf("  \"kernelMs\": %.2f,\n", ms);
  std::printf("  \"regionHours\": %.0f,\n", (double)total * HOURS_PER_YEAR * N_REGIONS);
  std::printf("  \"points\": [\n");
  for (int c = 0; c < nConfig; ++c) {
    std::vector<double> v(out.begin() + (size_t)c * nSample, out.begin() + (size_t)(c + 1) * nSample);
    std::sort(v.begin(), v.end());
    double mean = 0.0;
    for (double x : v) mean += x;
    mean /= (double)nSample;
    auto q = [&](double p) { return v[std::min((size_t)v.size() - 1, (size_t)(p * (v.size() - 1)))]; };
    int meets = 0;
    for (double x : v) if (x <= 0.01) meets++;
    std::printf("    {\"storageHours\": %g, \"overbuild\": %g, \"mean\": %.17g, \"p50\": %.17g, "
                "\"p95\": %.9g, \"p99\": %.9g, \"max\": %.9g, \"pMeetsTarget\": %.6f}%s\n",
                sh[c], ob[c], mean, q(0.50), q(0.95), q(0.99), v.back(),
                (double)meets / (double)nSample, c + 1 < nConfig ? "," : "");
  }
  std::printf("  ]\n}\n");

  cudaFree(dSolar);
  cudaFree(dLoad);
  cudaFree(dWind);
  cudaFree(dSh);
  cudaFree(dOb);
  cudaFree(dOut);
  return 0;
}
