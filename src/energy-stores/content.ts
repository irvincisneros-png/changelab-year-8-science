export type EnergyStoreMissionId =
  | "kinetic"
  | "gravitational"
  | "elastic"
  | "thermal"
  | "chemical"
  | "vault";

export type EnergyStoreMission = {
  id: EnergyStoreMissionId;
  number: string;
  title: string;
  storeLabel: string;
  hook: string;
  goal: string;
  checklist: readonly string[];
  feedback: {
    success: string;
    retry: string;
    scienceNote: string;
  };
};

export const ENERGY_STORE_MISSION_IDS: readonly EnergyStoreMissionId[] = [
  "kinetic",
  "gravitational",
  "elastic",
  "thermal",
  "chemical",
  "vault",
] as const;

export const ENERGY_STORE_MISSIONS: readonly EnergyStoreMission[] = [
  {
    id: "kinetic",
    number: "01",
    title: "Motion tracker",
    storeLabel: "Kinetic energy store",
    hook: "Launch two carts and make their energy bars respond to mass and speed.",
    goal: "Use the simulation to discover that faster and more massive moving objects have larger kinetic energy stores.",
    checklist: [
      "Change mass while keeping speed the same.",
      "Change speed while keeping mass the same.",
      "Match a target energy bar without needing to calculate it.",
    ],
    feedback: {
      success: "The moving object has a kinetic energy store. Your comparison used both its mass and its speed.",
      retry: "Keep one control fixed, then compare the other. Speed has a particularly strong effect.",
      scienceNote: "At the same mass, doubling speed makes the kinetic energy four times as large; students can see this relationship without performing the calculation.",
    },
  },
  {
    id: "gravitational",
    number: "02",
    title: "High-rise lift",
    storeLabel: "Gravitational potential energy store",
    hook: "Raise cargo to different platforms and watch the object–Earth system change.",
    goal: "Compare how mass and height affect the gravitational potential energy store relative to a chosen zero height.",
    checklist: [
      "Choose and display the zero-height reference.",
      "Compare two heights with the same cargo mass.",
      "Compare two masses at the same height.",
    ],
    feedback: {
      success: "A greater mass or height gives the object–Earth system a larger gravitational potential energy store relative to the chosen reference.",
      retry: "Check the platform height, cargo mass and the marked zero-height reference.",
      scienceNote: "The gravitational store belongs to the object–Earth system, not to the object alone, and its stated value depends on the chosen height reference.",
    },
  },
  {
    id: "elastic",
    number: "03",
    title: "Spring launcher",
    storeLabel: "Elastic potential energy store",
    hook: "Stretch springs, compare stiffness and predict which setup can launch the cart farther.",
    goal: "Explore how stiffness and stretch affect the elastic potential energy store before release.",
    checklist: [
      "Compare two stretches using the same spring.",
      "Compare two spring stiffnesses at the same stretch.",
      "Release the spring and observe the store decrease as motion begins.",
    ],
    feedback: {
      success: "The stretched or compressed spring has an elastic potential energy store. More stretch or greater stiffness increases it.",
      retry: "Compare one variable at a time: either spring stiffness or stretch.",
      scienceNote: "Doubling stretch produces four times the elastic model value when stiffness stays fixed; the interface should show the pattern rather than demand calculation.",
    },
  },
  {
    id: "thermal",
    number: "04",
    title: "Thermal comparer",
    storeLabel: "Thermal (internal) energy store",
    hook: "Compare warm samples that share a temperature but differ in amount or material.",
    goal: "Show that temperature alone does not tell us the size of a material's thermal energy store.",
    checklist: [
      "Compare different amounts of the same material at one temperature.",
      "Compare different materials using the same amount and temperature.",
      "Use one fixed reference temperature for every comparison.",
    ],
    feedback: {
      success: "Temperature is one factor, but the amount and type of material also affect the thermal energy store.",
      retry: "Two samples at the same temperature can have different thermal energy stores. Check their amount and material.",
      scienceNote: "This is a relative internal-energy model above a fixed reference, not an absolute value. Energy is not a hot substance stored inside the sample.",
    },
  },
  {
    id: "chemical",
    number: "05",
    title: "Fuel and food bank",
    storeLabel: "Chemical potential energy store",
    hook: "Compare amounts and types of battery material, fuel or food inside a chosen system.",
    goal: "Relate a chemical potential energy store to the amount and type of material without treating energy as a substance.",
    checklist: [
      "Compare different amounts of the same material.",
      "Compare material types while keeping amount fixed.",
      "Identify the materials included inside the chosen system boundary.",
    ],
    feedback: {
      success: "The chemical potential energy store depends on the amount and type of material in the chosen system.",
      retry: "Check both the material type and how much of it is included in the system.",
      scienceNote: "Chemical energy is associated with the arrangement and interactions of particles. It is misleading to say it is simply stored in individual bonds.",
    },
  },
  {
    id: "vault",
    number: "06",
    title: "Energy vault",
    storeLabel: "Mixed-store challenge",
    hook: "Unlock a vault by matching evidence from one busy system to every energy store present.",
    goal: "Classify kinetic, gravitational, elastic, thermal and chemical stores while rejecting transfer pathways as store labels.",
    checklist: [
      "Look for motion, height, stretch, material temperature and chemical material.",
      "Name the system that owns each selected store.",
      "Keep heating, radiation and mechanical work separate as transfer pathways.",
    ],
    feedback: {
      success: "The vault is mapped: each selected store is supported by evidence in its chosen system.",
      retry: "Use the visible evidence and system boundaries. A transfer pathway is not an extra energy store.",
      scienceNote: "Real situations can involve several stores and transfers at once. The classification depends on the system and instant chosen for analysis.",
    },
  },
] as const;

export const ENERGY_STORES_HOOK =
  "Energy is not a stored substance. Track how the energy of a chosen system changes when its motion, position, shape, temperature or materials change.";

export const ENERGY_STORES_GOAL =
  "Recognise and compare kinetic, gravitational potential, elastic potential, thermal/internal and chemical potential energy stores without requiring calculations.";

export const ENERGY_STORES_SCIENCE_GUARDRAILS = [
  "Use energy-store language as a model for a chosen system, not as if energy were a material kept in containers.",
  "Do not use temperature as a synonym for thermal energy; amount and material also matter.",
  "Describe the gravitational potential energy store as belonging to the object–Earth system.",
  "Describe chemical potential energy using particle arrangements and interactions, not as energy simply stored in bonds.",
  "Keep stores distinct from transfer pathways such as heating, radiation, electrical transfer and mechanical work.",
] as const;

export function getEnergyStoreMission(
  id: EnergyStoreMissionId,
): EnergyStoreMission {
  const mission = ENERGY_STORE_MISSIONS.find((item) => item.id === id);
  if (!mission) throw new RangeError(`Unknown energy-store mission: ${id}`);
  return mission;
}
