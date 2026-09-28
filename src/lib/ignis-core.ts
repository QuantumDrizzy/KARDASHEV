/**
 * The IGNIOS core inside KARDASHEV: the ecosystem's one rocket engine
 * (Unibit-Web ADR-0003). The same wasm bytes the IGNIOS site runs, whose
 * numbers the Unibit chain holds (repo `ignios`). Nothing here does physics; it
 * moves f64s across the boundary and turns a non-zero status into an Error.
 */
import { IGNIS_CORE_COMMIT, IGNIS_CORE_WASM_BASE64 } from "./ignis-core.gen.ts";

type Exports = {
  memory: WebAssembly.Memory;
  ignis_out_ptr(): number;
  ignis_out_len(): number;
  ignis_constants(): number;
  ignis_products(id: number): number;
  ignis_vandenkerckhove(gamma: number): number;
  ignis_characteristic_velocity_m_s(tcK: number, mKgMol: number, gamma: number): number;
  ignis_pressure_ratio_from_area_ratio(areaRatio: number, gamma: number): number;
  ignis_thrust_coefficient(pcPa: number, paPa: number, areaRatio: number, gamma: number): number;
};

const bytes = Uint8Array.from(atob(IGNIS_CORE_WASM_BASE64), (c) => c.charCodeAt(0));
const x = (await WebAssembly.instantiate(bytes, {})).instance.exports as unknown as Exports;

export { IGNIS_CORE_COMMIT };

function call(name: string, status: number, n: number): Float64Array {
  if (status !== 0) throw new Error(`${name}: IGNIOS core status ${status}`);
  return new Float64Array(x.memory.buffer, x.ignis_out_ptr(), x.ignis_out_len()).slice(0, n);
}

const k = call("constants", x.ignis_constants(), 2);
/** J/(mol·K), as the core holds it. */
export const R_UNIVERSAL_J_MOL_K = k[1];

export type IgnisPropellantId = "lox-rp1" | "lox-lh2" | "lox-ch4";
const INDEX: Record<IgnisPropellantId, number> = { "lox-rp1": 0, "lox-lh2": 1, "lox-ch4": 2 };

/** The recited R1 table entry (IGNIOS crates/ignis-thermochem). */
export function products(id: IgnisPropellantId) {
  const o = call("products", x.ignis_products(INDEX[id]), 3);
  return { chamberK: o[0], molarMassKgMol: o[1], gamma: o[2] };
}

export const vandenkerckhove = (gamma: number) => call("vandenkerckhove", x.ignis_vandenkerckhove(gamma), 1)[0];

export const characteristicVelocity = (chamberK: number, molarMassKgMol: number, gamma: number) =>
  call("characteristic_velocity_m_s", x.ignis_characteristic_velocity_m_s(chamberK, molarMassKgMol, gamma), 1)[0];

export const pressureRatioFromAreaRatio = (areaRatio: number, gamma: number) =>
  call("pressure_ratio_from_area_ratio", x.ignis_pressure_ratio_from_area_ratio(areaRatio, gamma), 1)[0];

export const thrustCoefficient = (pcPa: number, paPa: number, areaRatio: number, gamma: number) =>
  call("thrust_coefficient", x.ignis_thrust_coefficient(pcPa, paPa, areaRatio, gamma), 1)[0];
