import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_THERMAL_REFERENCE_C,
  SCIENCE_INVARIANTS,
  STORE_IDS,
  calculateChemical,
  calculateElastic,
  calculateGravitational,
  calculateKinetic,
  calculateThermal,
  classifyStore,
  evaluateVault,
  normaliseRelative,
} from "../src/energy-stores/engine.mjs";

test("kinetic store scales with mass and the square of speed", () => {
  const baseline = calculateKinetic({ massKg: 2, speedMps: 3 });
  assert.equal(calculateKinetic({ massKg: 4, speedMps: 3 }), baseline * 2);
  assert.equal(calculateKinetic({ massKg: 2, speedMps: 6 }), baseline * 4);
  assert.equal(calculateKinetic({ massKg: 2, speedMps: 0 }), 0);
});

test("gravitational store belongs to an object–Earth comparison and scales with mass and height", () => {
  const baseline = calculateGravitational({ massKg: 3, heightM: 2 });
  assert.equal(calculateGravitational({ massKg: 6, heightM: 2 }), baseline * 2);
  assert.equal(calculateGravitational({ massKg: 3, heightM: 4 }), baseline * 2);
  assert.equal(calculateGravitational({ massKg: 3, heightM: 0 }), 0);

  const classification = classifyStore("gravitational");
  assert.equal(classification?.category, "potential");
  assert.match(classification?.system ?? "", /object–Earth system/);
});

test("elastic store scales with stiffness and the square of stretch", () => {
  const baseline = calculateElastic({ stiffness: 4, stretch: 2 });
  assert.equal(calculateElastic({ stiffness: 8, stretch: 2 }), baseline * 2);
  assert.equal(calculateElastic({ stiffness: 4, stretch: 4 }), baseline * 4);
  assert.equal(calculateElastic({ stiffness: 4, stretch: 0 }), 0);
});

test("thermal model depends on amount, material and temperature above one reference", () => {
  const baseline = calculateThermal({
    massKg: 1,
    specificHeatFactor: 2,
    temperatureC: 30,
  });
  assert.equal(DEFAULT_THERMAL_REFERENCE_C, 0);
  assert.equal(
    calculateThermal({ massKg: 2, specificHeatFactor: 2, temperatureC: 30 }),
    baseline * 2,
  );
  assert.equal(
    calculateThermal({ massKg: 1, specificHeatFactor: 4, temperatureC: 30 }),
    baseline * 2,
  );
  assert.equal(
    calculateThermal({ massKg: 1, specificHeatFactor: 2, temperatureC: 60 }),
    baseline * 2,
  );
  assert.equal(
    calculateThermal({
      massKg: 1,
      specificHeatFactor: 2,
      temperatureC: 15,
      referenceC: 20,
    }),
    0,
  );
});

test("equal temperatures can represent different thermal store values", () => {
  const cup = calculateThermal({
    massKg: 0.25,
    specificHeatFactor: 4,
    temperatureC: 50,
  });
  const bucket = calculateThermal({
    massKg: 5,
    specificHeatFactor: 4,
    temperatureC: 50,
  });
  assert.ok(bucket > cup);
  assert.match(classifyStore("thermal")?.description ?? "", /not the same as temperature/i);
});

test("chemical model compares both stored amount and material type", () => {
  const baseline = calculateChemical({ amount: 2, typeFactor: 3 });
  assert.equal(calculateChemical({ amount: 4, typeFactor: 3 }), baseline * 2);
  assert.equal(calculateChemical({ amount: 2, typeFactor: 6 }), baseline * 2);
  assert.match(classifyStore("chemical")?.description ?? "", /not simply energy inside individual bonds/i);
});

test("relative normalisation is deterministic and clamped to the UI range", () => {
  assert.equal(normaliseRelative(0, 100), 0);
  assert.equal(normaliseRelative(25, 100), 0.25);
  assert.equal(normaliseRelative(150, 100), 1);
  assert.equal(normaliseRelative(0, 0), 0);
});

test("invalid physical comparison inputs fail clearly", () => {
  assert.throws(
    () => calculateKinetic({ massKg: -1, speedMps: 2 }),
    /massKg must be non-negative/,
  );
  assert.throws(
    () => calculateElastic({ stiffness: 2, stretch: Number.NaN }),
    /stretch must be a finite number/,
  );
  assert.throws(() => normaliseRelative(1, -1), /max must be non-negative/);
});

test("store classification recognises stores but not transfer pathways", () => {
  for (const storeId of STORE_IDS) {
    assert.equal(classifyStore(storeId)?.id, storeId);
  }
  assert.equal(classifyStore("heating"), null);
  assert.equal(classifyStore("radiation"), null);
  assert.equal(classifyStore("mechanical-work"), null);
});

test("mixed vault evaluates records and reports missing stores", () => {
  const result = evaluateVault({
    kinetic: true,
    gravitational: 0.8,
    elastic: true,
    thermal: true,
    chemical: false,
  });

  assert.equal(result.correct, false);
  assert.equal(result.score, 80);
  assert.equal(result.stars, 2);
  assert.deepEqual(result.missing, ["chemical"]);
  assert.deepEqual(result.unexpected, []);
});

test("mixed vault can use a mission-specific expected set and rejects transfer labels", () => {
  const exact = evaluateVault({
    selected: ["kinetic", "gravitational"],
    expected: ["kinetic", "gravitational"],
  });
  assert.equal(exact.correct, true);
  assert.equal(exact.score, 100);
  assert.equal(exact.stars, 3);

  const withTransfer = evaluateVault({
    selected: ["kinetic", "gravitational", "heating"],
    expected: ["kinetic", "gravitational"],
  });
  assert.equal(withTransfer.correct, false);
  assert.deepEqual(withTransfer.unexpected, ["heating"]);
  assert.match(withTransfer.feedback, /transfer/i);
});

test("science invariants retain the required Year 8 guardrails", () => {
  const invariantText = SCIENCE_INVARIANTS.join(" ");
  assert.match(invariantText, /not a stored substance/i);
  assert.match(invariantText, /temperature and thermal energy are different/i);
  assert.match(invariantText, /object–Earth system/);
  assert.match(invariantText, /not merely breaking or making one bond/i);
});
