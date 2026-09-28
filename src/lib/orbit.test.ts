import assert from "node:assert/strict";
import test from "node:test";
import {
  H_GEO_KM,
  HOHMANN_LEO_GEO,
  ISS,
  PANEL_W_M2,
  SSO,
  TYPE_I_PV,
  V_ESCAPE,
  circular,
  typeISwarm,
} from "./orbit.ts";

test("ISS ~408 km is ~7.67 km/s, ~92 min, ~0.89 g", () => {
  assert.ok(ISS.v > 7600 && ISS.v < 7700);
  assert.ok(ISS.periodS / 60 > 91 && ISS.periodS / 60 < 94);
  assert.ok(ISS.gFrac > 0.87 && ISS.gFrac < 0.91);
});

test("SSO 550 km is slower than ISS, period ~96 min", () => {
  const s = circular(550);
  assert.ok(s.v < ISS.v);
  assert.ok(s.periodS / 60 > 94 && s.periodS / 60 < 97);
  assert.equal(SSO.hKm, 550);
});

test("sun-in-plane eclipse at ISS is ~35–40%", () => {
  assert.ok(ISS.eclipseFrac > 0.35 && ISS.eclipseFrac < 0.42);
});

test("surface escape is ~11.2 km/s", () => {
  assert.ok(V_ESCAPE > 11_100 && V_ESCAPE < 11_250);
});

test("sidereal GEO height is ~35,800 km", () => {
  assert.ok(H_GEO_KM > 35_700 && H_GEO_KM < 36_000);
});

test("Hohmann LEO→GEO is ~3.9 km/s", () => {
  assert.ok(HOHMANN_LEO_GEO.dv > 3800 && HOHMANN_LEO_GEO.dv < 4000);
});

test("Type I as AM0 PV is tens of millions of km²", () => {
  assert.ok(PANEL_W_M2 > 300 && PANEL_W_M2 < 380);
  assert.ok(TYPE_I_PV.areaM2 > 2.5e13 && TYPE_I_PV.areaM2 < 3.5e13);
  const r = typeISwarm(1.2, 100_000, 3);
  assert.ok(r.flights > 3e8 && r.flights < 4e8);
});
