/**
 * A small, deterministic Year 8 model for comparing energy stores.
 *
 * The returned numbers are relative model values. They are intended for bars,
 * rankings and cause-and-effect comparisons in the simulator, not for students
 * to calculate or treat as laboratory measurements.
 */

/** @typedef {"kinetic" | "gravitational" | "elastic" | "thermal" | "chemical"} EnergyStoreId */

/**
 * @typedef {object} StoreClassification
 * @property {EnergyStoreId} id
 * @property {string} label
 * @property {"kinetic" | "potential" | "internal"} category
 * @property {string} system
 * @property {string} description
 */

/**
 * @typedef {object} VaultEvaluation
 * @property {boolean} correct
 * @property {number} score Percentage from 0 to 100.
 * @property {0 | 1 | 2 | 3} stars
 * @property {EnergyStoreId[]} selected
 * @property {EnergyStoreId[]} expected
 * @property {EnergyStoreId[]} matched
 * @property {EnergyStoreId[]} missing
 * @property {string[]} unexpected
 * @property {string} feedback
 */

export const GRAVITY_MPS2 = 9.8;
export const DEFAULT_THERMAL_REFERENCE_C = 0;

/** @type {readonly EnergyStoreId[]} */
export const STORE_IDS = Object.freeze([
  "kinetic",
  "gravitational",
  "elastic",
  "thermal",
  "chemical",
]);

/** @type {Readonly<Record<EnergyStoreId, StoreClassification>>} */
export const STORE_CLASSIFICATIONS = Object.freeze({
  kinetic: Object.freeze({
    id: "kinetic",
    label: "Kinetic energy store",
    category: "kinetic",
    system: "the moving object",
    description: "A moving object has a kinetic energy store.",
  }),
  gravitational: Object.freeze({
    id: "gravitational",
    label: "Gravitational potential energy store",
    category: "potential",
    system: "the object–Earth system",
    description:
      "The gravitational potential energy store belongs to the object–Earth system and depends on the chosen height reference.",
  }),
  elastic: Object.freeze({
    id: "elastic",
    label: "Elastic potential energy store",
    category: "potential",
    system: "the stretched or compressed elastic object",
    description:
      "A stretched or compressed elastic object can have an elastic potential energy store.",
  }),
  thermal: Object.freeze({
    id: "thermal",
    label: "Thermal (internal) energy store",
    category: "internal",
    system: "the material being compared",
    description:
      "The thermal energy store depends on the amount and type of material as well as its temperature; it is not the same as temperature.",
  }),
  chemical: Object.freeze({
    id: "chemical",
    label: "Chemical potential energy store",
    category: "potential",
    system: "the reacting or energy-supplying materials",
    description:
      "The chemical energy store is associated with the arrangement and interactions of particles in a material system, not simply energy inside individual bonds.",
  }),
});

export const SCIENCE_INVARIANTS = Object.freeze([
  "Energy is a property of a chosen system, not a stored substance.",
  "At fixed mass, doubling speed makes the kinetic model value four times as large.",
  "At fixed mass, gravitational potential energy increases with height above the chosen reference.",
  "At fixed stiffness, doubling stretch makes the elastic model value four times as large.",
  "Temperature and thermal energy are different quantities: amount and material also matter.",
  "The gravitational store belongs to the object–Earth system.",
  "Chemical energy changes involve the whole particle arrangement and interactions, not merely breaking or making one bond.",
]);

/**
 * Relative kinetic energy model, using the standard 1/2 mv² relationship.
 * @param {{massKg: number, speedMps: number}} input
 * @returns {number}
 */
export function calculateKinetic({ massKg, speedMps }) {
  requireNonNegative("massKg", massKg);
  requireNonNegative("speedMps", speedMps);
  return 0.5 * massKg * speedMps ** 2;
}

/**
 * Relative gravitational potential energy for an object–Earth system.
 * Height is measured above a deliberately chosen zero-height reference.
 * @param {{massKg: number, heightM: number}} input
 * @returns {number}
 */
export function calculateGravitational({ massKg, heightM }) {
  requireNonNegative("massKg", massKg);
  requireNonNegative("heightM", heightM);
  return massKg * GRAVITY_MPS2 * heightM;
}

/**
 * Relative elastic potential energy model, using 1/2 kx².
 * `stiffness` is a comparison factor and `stretch` is measured from the
 * unstretched position; the UI need not expose formal units to students.
 * @param {{stiffness: number, stretch: number}} input
 * @returns {number}
 */
export function calculateElastic({ stiffness, stretch }) {
  requireNonNegative("stiffness", stiffness);
  requireNonNegative("stretch", stretch);
  return 0.5 * stiffness * stretch ** 2;
}

/**
 * Age-appropriate relative thermal/internal energy model.
 *
 * It compares material above a shared temperature reference. It is not an
 * absolute internal-energy calculation, and temperature alone does not set
 * the result.
 * @param {{massKg: number, specificHeatFactor: number, temperatureC: number, referenceC?: number}} input
 * @returns {number}
 */
export function calculateThermal({
  massKg,
  specificHeatFactor,
  temperatureC,
  referenceC = DEFAULT_THERMAL_REFERENCE_C,
}) {
  requireNonNegative("massKg", massKg);
  requireNonNegative("specificHeatFactor", specificHeatFactor);
  requireFinite("temperatureC", temperatureC);
  requireFinite("referenceC", referenceC);

  const temperatureAboveReference = Math.max(0, temperatureC - referenceC);
  return massKg * specificHeatFactor * temperatureAboveReference;
}

/**
 * Relative chemical potential energy model for a chosen material system.
 * `typeFactor` represents how the material compares with other materials; it
 * does not imply that energy is simply located inside individual bonds.
 * @param {{amount: number, typeFactor: number}} input
 * @returns {number}
 */
export function calculateChemical({ amount, typeFactor }) {
  requireNonNegative("amount", amount);
  requireNonNegative("typeFactor", typeFactor);
  return amount * typeFactor;
}

/**
 * Convert a non-negative relative value to a UI-friendly 0–1 proportion.
 * Values above the selected comparison maximum are clamped to 1.
 * @param {number} value
 * @param {number} max
 * @returns {number}
 */
export function normaliseRelative(value, max) {
  requireNonNegative("value", value);
  requireNonNegative("max", max);
  if (max === 0) return 0;
  return Math.min(1, value / max);
}

/**
 * Return curriculum language and system ownership for a known store.
 * Unknown IDs return `null`, allowing the UI to reject transfer mechanisms
 * such as heating or radiation without throwing.
 * @param {string} storeId
 * @returns {StoreClassification | null}
 */
export function classifyStore(storeId) {
  return Object.prototype.hasOwnProperty.call(STORE_CLASSIFICATIONS, storeId)
    ? STORE_CLASSIFICATIONS[/** @type {EnergyStoreId} */ (storeId)]
    : null;
}

/**
 * Evaluate a mixed "energy vault" selection.
 *
 * The simplest call is a record such as `{ kinetic: true, thermal: 0.7 }`;
 * booleans or positive strengths count as selected. A configurable activity
 * can instead pass `{ selected, expected }`, where `selected` is a record or
 * array and `expected` is an array of store IDs. By default, the vault expects
 * all five stores.
 *
 * @param {Record<string, boolean | number> | readonly string[] | {
 *   selected: Record<string, boolean | number> | readonly string[],
 *   expected?: readonly EnergyStoreId[]
 * }} selections
 * @returns {VaultEvaluation}
 */
export function evaluateVault(selections) {
  const hasEnvelope =
    selections !== null &&
    !Array.isArray(selections) &&
    typeof selections === "object" &&
    Object.prototype.hasOwnProperty.call(selections, "selected");

  const envelope = hasEnvelope
    ? /** @type {{
        selected: Record<string, boolean | number> | readonly string[],
        expected?: readonly EnergyStoreId[]
      }} */ (selections)
    : null;
  const selectedInput = envelope
    ? envelope.selected
    : /** @type {Record<string, boolean | number> | readonly string[]} */ (selections);
  const expectedInput = envelope?.expected
    ? envelope.expected
    : STORE_IDS;

  const selectedIds = toSelectedIds(selectedInput);
  const expected = uniqueKnownStoreIds(expectedInput);

  const selected = STORE_IDS.filter((id) => selectedIds.includes(id));
  const unexpected = selectedIds.filter((id) => classifyStore(id) === null);
  const matched = expected.filter((id) => selected.includes(id));
  const missing = expected.filter((id) => !selected.includes(id));
  const falsePositiveKnownStores = selected.filter((id) => !expected.includes(id));
  const allUnexpected = [...falsePositiveKnownStores, ...unexpected];
  const correct = missing.length === 0 && allUnexpected.length === 0;

  const denominator = Math.max(1, expected.length);
  const score = Math.round(
    Math.max(0, (matched.length - allUnexpected.length) / denominator) * 100,
  );
  const stars = /** @type {0 | 1 | 2 | 3} */ (
    correct ? 3 : score >= 70 ? 2 : score > 0 ? 1 : 0
  );

  return {
    correct,
    score,
    stars,
    selected,
    expected,
    matched,
    missing,
    unexpected: allUnexpected,
    feedback: vaultFeedback({ correct, missing, unexpected: allUnexpected }),
  };
}

/** @param {string} name @param {number} value */
function requireFinite(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

/** @param {string} name @param {number} value */
function requireNonNegative(name, value) {
  requireFinite(name, value);
  if (value < 0) throw new RangeError(`${name} must be non-negative`);
}

/**
 * @param {Record<string, boolean | number> | readonly string[]} input
 * @returns {string[]}
 */
function toSelectedIds(input) {
  if (Array.isArray(input)) {
    return [...new Set(input.filter((id) => typeof id === "string"))];
  }
  if (input === null || typeof input !== "object") {
    throw new TypeError("selections must be an array, record, or selection envelope");
  }

  return Object.entries(input)
    .filter(([, value]) => value === true || (typeof value === "number" && value > 0))
    .map(([id]) => id);
}

/**
 * @param {readonly string[]} ids
 * @returns {EnergyStoreId[]}
 */
function uniqueKnownStoreIds(ids) {
  if (!Array.isArray(ids)) throw new TypeError("expected must be an array");
  const unique = [...new Set(ids)];
  for (const id of unique) {
    if (classifyStore(id) === null) {
      throw new RangeError(`Unknown expected energy store: ${id}`);
    }
  }
  return STORE_IDS.filter((id) => unique.includes(id));
}

/**
 * @param {{correct: boolean, missing: EnergyStoreId[], unexpected: string[]}} result
 * @returns {string}
 */
function vaultFeedback({ correct, missing, unexpected }) {
  if (correct) {
    return "Vault mapped: every energy store has been matched to evidence in the chosen system.";
  }
  if (missing.length > 0 && unexpected.length === 0) {
    return "Some stores are still hidden. Look again for motion, height, stretch, temperature and material changes.";
  }
  if (missing.length === 0) {
    return "The stores are present, but one selected label is not part of this system. Remember that heating and radiation describe transfers, not stores.";
  }
  return "Check both the missing evidence and the extra labels. Classify energy stores in the chosen system, not the pathway used to transfer energy.";
}
