export type StoreId = "kinetic" | "gravitational" | "elastic" | "thermal" | "chemical";

export const GRAVITY_MPS2: number;
export const DEFAULT_THERMAL_REFERENCE_C: number;
export const STORE_IDS: readonly StoreId[];
export const STORE_CLASSIFICATIONS: Readonly<Record<StoreId, {
  id: StoreId;
  label: string;
  category: "kinetic" | "potential" | "internal";
  system: string;
  description: string;
}>>;

export function calculateKinetic(input: { massKg: number; speedMps: number }): number;
export function calculateGravitational(input: { massKg: number; heightM: number }): number;
export function calculateElastic(input: { stiffness: number; stretch: number }): number;
export function calculateThermal(input: { massKg: number; specificHeatFactor: number; temperatureC: number; referenceC?: number }): number;
export function calculateChemical(input: { amount: number; typeFactor: number }): number;
export function normaliseRelative(value: number, max: number): number;
export function classifyStore(storeId: string): (typeof STORE_CLASSIFICATIONS)[StoreId] | null;
export function evaluateVault(selections: Record<string, boolean | number> | readonly string[] | {
  selected: Record<string, boolean | number> | readonly string[];
  expected?: readonly StoreId[];
}): {
  correct: boolean;
  score: number;
  stars: 0 | 1 | 2 | 3;
  selected: StoreId[];
  expected: StoreId[];
  matched: StoreId[];
  missing: StoreId[];
  unexpected: string[];
  feedback: string;
};
