// KARDASHEV M4 — statevector simulator, CUDA, sm_120.
//
// /quantum says "quantum does not raise K". That is a claim about energy, so it
// deserves a measurement rather than an assertion. This is the measurement.
//
// A statevector over n qubits is 2^n complex amplitudes. Every gate touches all
// of them. So the simulator is:
//   - memory-bandwidth bound, exactly like LLM decode (see compute-energy.ts);
//   - exponential in n, with a hard wall where 2^n * sizeof(complex) > VRAM.
//
// Two numbers come out of it and both belong on the page:
//   1. the qubit wall on 16 GB, measured rather than quoted;
//   2. joules per gate, measured, which extrapolates to the n at which brute-
//      force simulation of a quantum state would exceed a Type I power budget.
//
// A statevector simulator that gets the amplitudes wrong is a memcpy benchmark
// wearing a lab coat, so --validate checks Bell, GHZ, QFT and unitarity before
// any timing number is believed.
//
// Build: native/qsim/build.cmd

#define _USE_MATH_DEFINES
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cmath>
#include <vector>
#include <complex>
#include <cuda_runtime.h>

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

typedef double2 cplx;  // complex128: 16 bytes per amplitude

// ─────────────────────────────────────────────────────────────────── kernels

// Single-qubit gate. Each thread owns one PAIR of amplitudes that differ only
// in bit `t`, so the launch is 2^(n-1) threads and every amplitude is touched
// exactly once.
//
// [MEASURED, and it contradicted the guess written here first] The comment used
// to predict poor coalescing for t = 0. It is wrong: 383 GB/s at t = 0 against
// 381 GB/s at t = n-1. For t = 0 the partner amplitudes are ADJACENT, so a warp
// covering 32 consecutive pairs reads 64 consecutive amplitudes — perfectly
// coalesced. For high t each of the two halves is its own coalesced run. Both
// layouts saturate. The benchmark keeps both because the claim was checkable.
__global__ void apply1q(cplx *psi, long long half, int t, double m00r, double m00i,
                        double m01r, double m01i, double m10r, double m10i, double m11r,
                        double m11i) {
  long long k = (long long)blockIdx.x * blockDim.x + threadIdx.x;
  if (k >= half) return;
  long long mask = 1LL << t;
  long long low = k & (mask - 1);
  long long high = (k & ~(mask - 1)) << 1;
  long long i0 = high | low;
  long long i1 = i0 | mask;

  cplx a = psi[i0];
  cplx b = psi[i1];
  psi[i0].x = m00r * a.x - m00i * a.y + m01r * b.x - m01i * b.y;
  psi[i0].y = m00r * a.y + m00i * a.x + m01r * b.y + m01i * b.x;
  psi[i1].x = m10r * a.x - m10i * a.y + m11r * b.x - m11i * b.y;
  psi[i1].y = m10r * a.y + m10i * a.x + m11r * b.y + m11i * b.x;
}

// CNOT. One thread per quarter of the space: the indices with control = 1 and
// target = 0, each swapping with its target = 1 partner.
__global__ void applyCnot(cplx *psi, long long quarter, int c, int t) {
  long long k = (long long)blockIdx.x * blockDim.x + threadIdx.x;
  if (k >= quarter) return;
  int lo = c < t ? c : t;
  int hi = c < t ? t : c;
  long long maskLo = 1LL << lo;
  long long maskHi = 1LL << hi;
  long long a = k & (maskLo - 1);
  long long b = (k & ((maskHi >> 1) - maskLo)) << 1;
  long long d = (k & ~((maskHi >> 1) - 1)) << 2;
  long long base = d | b | a | (1LL << c);
  long long i0 = base & ~(1LL << t);
  long long i1 = i0 | (1LL << t);
  cplx tmp = psi[i0];
  psi[i0] = psi[i1];
  psi[i1] = tmp;
}

// Controlled phase, the workhorse of QFT. Diagonal, so it is a pure read-modify
// -write with no partner lookup.
__global__ void applyCPhase(cplx *psi, long long total, int c, int t, double ang) {
  long long i = (long long)blockIdx.x * blockDim.x + threadIdx.x;
  if (i >= total) return;
  if (((i >> c) & 1LL) && ((i >> t) & 1LL)) {
    double cs = cos(ang), sn = sin(ang);
    cplx v = psi[i];
    psi[i].x = v.x * cs - v.y * sn;
    psi[i].y = v.x * sn + v.y * cs;
  }
}

__global__ void setBasis(cplx *psi, long long total, long long idx) {
  long long i = (long long)blockIdx.x * blockDim.x + threadIdx.x;
  if (i >= total) return;
  psi[i].x = (i == idx) ? 1.0 : 0.0;
  psi[i].y = 0.0;
}

// Norm squared, block-reduced. Unitarity check: must stay 1.
__global__ void normSq(const cplx *psi, long long total, double *out) {
  extern __shared__ double sm[];
  long long i = (long long)blockIdx.x * blockDim.x + threadIdx.x;
  long long stride = (long long)gridDim.x * blockDim.x;
  double acc = 0.0;
  for (; i < total; i += stride) {
    cplx v = psi[i];
    acc += v.x * v.x + v.y * v.y;
  }
  sm[threadIdx.x] = acc;
  __syncthreads();
  for (int s = blockDim.x / 2; s > 0; s >>= 1) {
    if (threadIdx.x < s) sm[threadIdx.x] += sm[threadIdx.x + s];
    __syncthreads();
  }
  if (threadIdx.x == 0) atomicAdd(out, sm[0]);
}

// ───────────────────────────────────────────────────────────────────── host

static const int TPB = 256;
static long long gridFor(long long work) { return (work + TPB - 1) / TPB; }

struct Sim {
  int n;
  long long total;
  cplx *psi;
};

static void simAlloc(Sim &s, int n) {
  s.n = n;
  s.total = 1LL << n;
  CUDA_OK(cudaMalloc(&s.psi, (size_t)s.total * sizeof(cplx)));
}
static void simFree(Sim &s) { cudaFree(s.psi); }

static void gateH(Sim &s, int t) {
  double r = 1.0 / std::sqrt(2.0);
  apply1q<<<gridFor(s.total >> 1), TPB>>>(s.psi, s.total >> 1, t, r, 0, r, 0, r, 0, -r, 0);
}
static void gateX(Sim &s, int t) {
  apply1q<<<gridFor(s.total >> 1), TPB>>>(s.psi, s.total >> 1, t, 0, 0, 1, 0, 1, 0, 0, 0);
}
static void gateRy(Sim &s, int t, double th) {
  double c = std::cos(th / 2), sn = std::sin(th / 2);
  apply1q<<<gridFor(s.total >> 1), TPB>>>(s.psi, s.total >> 1, t, c, 0, -sn, 0, sn, 0, c, 0);
}
static void gateCnot(Sim &s, int c, int t) {
  applyCnot<<<gridFor(s.total >> 2), TPB>>>(s.psi, s.total >> 2, c, t);
}
static void gateCPhase(Sim &s, int c, int t, double ang) {
  applyCPhase<<<gridFor(s.total), TPB>>>(s.psi, s.total, c, t, ang);
}

static double simNorm(Sim &s) {
  double *d, h = 0.0;
  CUDA_OK(cudaMalloc(&d, sizeof(double)));
  CUDA_OK(cudaMemcpy(d, &h, sizeof(double), cudaMemcpyHostToDevice));
  int blocks = 1024;
  normSq<<<blocks, TPB, TPB * sizeof(double)>>>(s.psi, s.total, d);
  CUDA_OK(cudaDeviceSynchronize());
  CUDA_OK(cudaMemcpy(&h, d, sizeof(double), cudaMemcpyDeviceToHost));
  cudaFree(d);
  return h;
}

static std::vector<std::complex<double>> simDownload(Sim &s) {
  std::vector<cplx> raw((size_t)s.total);
  CUDA_OK(cudaMemcpy(raw.data(), s.psi, (size_t)s.total * sizeof(cplx), cudaMemcpyDeviceToHost));
  std::vector<std::complex<double>> out((size_t)s.total);
  for (size_t i = 0; i < raw.size(); ++i) out[i] = {raw[i].x, raw[i].y};
  return out;
}

// QFT, textbook ordering, without the final bit-reversal swaps.
static void qft(Sim &s) {
  for (int j = s.n - 1; j >= 0; --j) {
    gateH(s, j);
    for (int k = j - 1; k >= 0; --k) gateCPhase(s, k, j, KPI / (double)(1LL << (j - k)));
  }
}

// ─────────────────────────────────────────────────────────────────── validate

static int failures = 0;
static void check(const char *what, bool ok, const char *detail = "") {
  std::printf("  %-46s %s %s\n", what, ok ? "PASS" : "FAIL", detail);
  if (!ok) failures++;
}

static void validate() {
  std::printf("VALIDATION — physics before timings\n");

  {  // Bell: H(0), CNOT(0,1) -> (|00> + |11>)/sqrt(2)
    Sim s;
    simAlloc(s, 2);
    setBasis<<<gridFor(s.total), TPB>>>(s.psi, s.total, 0);
    gateH(s, 0);
    gateCnot(s, 0, 1);
    CUDA_OK(cudaDeviceSynchronize());
    auto v = simDownload(s);
    double r = 1.0 / std::sqrt(2.0);
    bool ok = std::abs(v[0].real() - r) < 1e-12 && std::abs(v[3].real() - r) < 1e-12 &&
              std::abs(v[1]) < 1e-12 && std::abs(v[2]) < 1e-12;
    char buf[128];
    std::snprintf(buf, sizeof(buf), "|00>=%.6f |11>=%.6f", v[0].real(), v[3].real());
    check("Bell state amplitudes", ok, buf);
    simFree(s);
  }

  {  // GHZ on 20 qubits: only |0..0> and |1..1> populated.
    int n = 20;
    Sim s;
    simAlloc(s, n);
    setBasis<<<gridFor(s.total), TPB>>>(s.psi, s.total, 0);
    gateH(s, 0);
    for (int q = 1; q < n; ++q) gateCnot(s, q - 1, q);
    CUDA_OK(cudaDeviceSynchronize());
    auto v = simDownload(s);
    double r = 1.0 / std::sqrt(2.0);
    double leak = 0.0;
    for (long long i = 0; i < s.total; ++i)
      if (i != 0 && i != s.total - 1) leak += std::norm(v[(size_t)i]);
    bool ok = std::abs(v[0].real() - r) < 1e-12 &&
              std::abs(v[(size_t)s.total - 1].real() - r) < 1e-12 && leak < 1e-20;
    char buf[128];
    std::snprintf(buf, sizeof(buf), "leak=%.3e", leak);
    check("GHZ-20: only the two poles populated", ok, buf);
    simFree(s);
  }

  {  // QFT of a basis state has uniform magnitude 2^(-n/2) everywhere.
    int n = 12;
    Sim s;
    simAlloc(s, n);
    setBasis<<<gridFor(s.total), TPB>>>(s.psi, s.total, 5);
    qft(s);
    CUDA_OK(cudaDeviceSynchronize());
    auto v = simDownload(s);
    double want = std::pow(2.0, -n / 2.0);
    double worst = 0.0;
    for (long long i = 0; i < s.total; ++i) worst = std::max(worst, std::abs(std::abs(v[(size_t)i]) - want));
    char buf[128];
    std::snprintf(buf, sizeof(buf), "max|dev|=%.3e", worst);
    check("QFT of a basis state is flat in magnitude", worst < 1e-13, buf);
    simFree(s);
  }

  {  // Unitarity over a deep random circuit.
    int n = 22;
    Sim s;
    simAlloc(s, n);
    setBasis<<<gridFor(s.total), TPB>>>(s.psi, s.total, 0);
    unsigned int st = 12345u;
    auto rnd = [&]() { st = st * 1664525u + 1013904223u; return (double)(st >> 8) / 16777216.0; };
    for (int g = 0; g < 300; ++g) {
      int t = (int)(rnd() * n) % n;
      if (rnd() < 0.5) {
        gateRy(s, t, rnd() * 2.0 * KPI);
      } else {
        int c = (int)(rnd() * n) % n;
        if (c != t) gateCnot(s, c, t);
      }
    }
    CUDA_OK(cudaDeviceSynchronize());
    double nrm = simNorm(s);
    char buf[128];
    std::snprintf(buf, sizeof(buf), "norm=%.15f after 300 gates", nrm);
    check("unitarity preserved on a random circuit", std::abs(nrm - 1.0) < 1e-10, buf);
    simFree(s);
  }
}

// ────────────────────────────────────────────────────────────────── benchmark

static void bench(int maxN) {
  size_t freeB = 0, totalB = 0;
  CUDA_OK(cudaMemGetInfo(&freeB, &totalB));
  std::printf("{\n  \"vramTotalBytes\": %zu,\n  \"vramFreeBytes\": %zu,\n", totalB, freeB);
  std::printf("  \"bytesPerAmplitude\": %zu,\n", sizeof(cplx));
  std::printf("  \"gates\": [\n");
  bool first = true;
  for (int n = 20; n <= maxN; ++n) {
    size_t need = ((size_t)1 << n) * sizeof(cplx);
    if (need > freeB * 9 / 10) {
      std::printf("%s    {\"qubits\": %d, \"bytes\": %zu, \"fits\": false}", first ? "" : ",\n", n, need);
      first = false;
      break;
    }
    Sim s;
    simAlloc(s, n);
    setBasis<<<gridFor(s.total), TPB>>>(s.psi, s.total, 0);
    CUDA_OK(cudaDeviceSynchronize());

    cudaEvent_t a, b;
    CUDA_OK(cudaEventCreate(&a));
    CUDA_OK(cudaEventCreate(&b));
    const int reps = 20;
    // Warm up, then time H on a high qubit (coalesced) and on qubit 0 (strided).
    gateH(s, n - 1);
    CUDA_OK(cudaDeviceSynchronize());

    CUDA_OK(cudaEventRecord(a));
    for (int i = 0; i < reps; ++i) gateH(s, n - 1);
    CUDA_OK(cudaEventRecord(b));
    CUDA_OK(cudaDeviceSynchronize());
    float msHigh = 0;
    CUDA_OK(cudaEventElapsedTime(&msHigh, a, b));

    CUDA_OK(cudaEventRecord(a));
    for (int i = 0; i < reps; ++i) gateH(s, 0);
    CUDA_OK(cudaEventRecord(b));
    CUDA_OK(cudaDeviceSynchronize());
    float msLow = 0;
    CUDA_OK(cudaEventElapsedTime(&msLow, a, b));

    CUDA_OK(cudaEventRecord(a));
    for (int i = 0; i < reps; ++i) gateCnot(s, 0, n - 1);
    CUDA_OK(cudaEventRecord(b));
    CUDA_OK(cudaDeviceSynchronize());
    float msCnot = 0;
    CUDA_OK(cudaEventElapsedTime(&msCnot, a, b));

    double bytesPerGate = (double)s.total * sizeof(cplx) * 2.0;  // read + write
    double sHigh = msHigh / 1000.0 / reps;
    double sLow = msLow / 1000.0 / reps;
    double sCnot = msCnot / 1000.0 / reps;
    std::printf(
        "%s    {\"qubits\": %d, \"bytes\": %zu, \"fits\": true, \"sPerGateHigh\": %.9g, "
        "\"sPerGateLow\": %.9g, \"sPerCnot\": %.9g, \"gbsHigh\": %.4f, \"gbsLow\": %.4f}",
        first ? "" : ",\n", n, need, sHigh, sLow, sCnot, bytesPerGate / sHigh / 1e9,
        bytesPerGate / sLow / 1e9);
    first = false;
    cudaEventDestroy(a);
    cudaEventDestroy(b);
    simFree(s);
  }
  std::printf("\n  ]\n}\n");
}

int main(int argc, char **argv) {
  bool doValidate = false, doBench = false;
  int maxN = 31;
  for (int i = 1; i < argc; ++i) {
    if (!strcmp(argv[i], "--validate")) doValidate = true;
    else if (!strcmp(argv[i], "--bench")) doBench = true;
    else if (!strcmp(argv[i], "--max") && i + 1 < argc) maxN = atoi(argv[++i]);
  }
  if (!doValidate && !doBench) doValidate = doBench = true;
  if (doValidate) {
    validate();
    if (failures) {
      std::fprintf(stderr, "%d validation failure(s) — timings withheld\n", failures);
      return 1;
    }
    std::printf("\n");
  }
  if (doBench) bench(maxN);
  return 0;
}
