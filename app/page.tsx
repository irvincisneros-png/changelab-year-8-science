"use client";

import { useEffect, useMemo, useState } from "react";

type ScenarioId = "conduction" | "convection" | "radiation" | "mastery";
type Result = { success: boolean; title: string; explanation: string; stars: number };

const scenarios: Array<{
  id: ScenarioId;
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  colour: string;
}> = [
  { id: "conduction", number: "01", title: "Handle the heat", subtitle: "Conduction", icon: "⌁", colour: "#ff7a5c" },
  { id: "convection", number: "02", title: "Warm the room", subtitle: "Convection", icon: "↻", colour: "#55cfea" },
  { id: "radiation", number: "03", title: "Shield the habitat", subtitle: "Radiation", icon: "☀", colour: "#ffbf5b" },
  { id: "mastery", number: "04", title: "Thermal orbit", subtitle: "Mixed challenge", icon: "✦", colour: "#9b8cff" },
];

const materials = {
  copper: { label: "Copper", factor: 1, tone: "#d9794e" },
  steel: { label: "Steel", factor: 0.55, tone: "#aab6c3" },
  wood: { label: "Wood", factor: 0.12, tone: "#ae7446" },
  silicone: { label: "Silicone", factor: 0.05, tone: "#6cc7c0" },
};

const surfaces = {
  black: { label: "Black matte", absorption: 0.9, tone: "#20242c" },
  white: { label: "White paint", absorption: 0.42, tone: "#eef1f5" },
  silver: { label: "Polished silver", absorption: 0.12, tone: "#b9d5e3" },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function Home() {
  const [active, setActive] = useState<ScenarioId>("conduction");
  const [completed, setCompleted] = useState<ScenarioId[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [heatLens, setHeatLens] = useState(true);
  const [particles, setParticles] = useState(true);

  const [handleMaterial, setHandleMaterial] = useState<keyof typeof materials>("steel");
  const [burnerPower, setBurnerPower] = useState(70);
  const [heaterPosition, setHeaterPosition] = useState<"floor" | "middle" | "ceiling">("middle");
  const [heaterPower, setHeaterPower] = useState(65);
  const [fanOn, setFanOn] = useState(false);
  const [ventOpen, setVentOpen] = useState(true);
  const [surface, setSurface] = useState<keyof typeof surfaces>("black");
  const [distance, setDistance] = useState(2);
  const [vacuum, setVacuum] = useState(true);
  const [orbitShield, setOrbitShield] = useState<keyof typeof surfaces>("white");
  const [insulated, setInsulated] = useState(false);
  const [cabinFan, setCabinFan] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return current + 2;
      });
    }, 70);
    return () => window.clearInterval(timer);
  }, [running]);

  const metrics = useMemo(() => {
    const fraction = progress / 100;
    const conductivity = materials[handleMaterial].factor;
    const waterTemp = 22 + burnerPower * 0.72 * fraction;
    const handleTemp = 22 + burnerPower * conductivity * 0.62 * fraction;

    const positionEfficiency = { floor: 1, middle: 0.72, ceiling: 0.46 }[heaterPosition];
    const mixingBonus = fanOn ? 0.16 : ventOpen ? 0.08 : 0;
    const roomMean = 14 + heaterPower * (positionEfficiency + mixingBonus) * 0.15 * fraction;
    const roomSpread = clamp(8 - positionEfficiency * 4 - (fanOn ? 3 : 0) - (ventOpen ? 1 : 0), 0.8, 8);

    const radiantGain = (68 * surfaces[surface].absorption) / Math.pow(distance, 0.72);
    const habitatTemp = 12 + radiantGain * fraction;

    const orbitAbsorption = surfaces[orbitShield].absorption;
    const exteriorTemp = 20 + 58 * orbitAbsorption * fraction;
    const cabinTemp = 20 + (insulated ? 8 : 19) * orbitAbsorption * fraction - (cabinFan ? 1.2 : 0);

    return { waterTemp, handleTemp, roomMean, roomSpread, habitatTemp, exteriorTemp, cabinTemp };
  }, [progress, handleMaterial, burnerPower, heaterPosition, heaterPower, fanOn, ventOpen, surface, distance, orbitShield, insulated, cabinFan]);

  const outcome = useMemo<Result>(() => {
    if (active === "conduction") {
      const success = metrics.waterTemp >= 68 && metrics.handleTemp < 43;
      return success
        ? { success, stars: handleMaterial === "silicone" || handleMaterial === "wood" ? 3 : 2, title: "Soup hot. Handle safe.", explanation: `${materials[handleMaterial].label} slows conduction, so far less thermal energy reaches the grip while the water warms.` }
        : { success, stars: 1, title: metrics.waterTemp < 68 ? "The soup needs more energy" : "That handle is too hot", explanation: metrics.waterTemp < 68 ? "Raise the burner power so more thermal energy transfers into the pan and water." : `${materials[handleMaterial].label} conducts energy along the handle too quickly. Try a better insulator.` };
    }
    if (active === "convection") {
      const success = metrics.roomMean >= 22 && metrics.roomSpread <= 3.5;
      return success
        ? { success, stars: heaterPosition === "floor" && fanOn ? 3 : 2, title: "Comfort reached evenly", explanation: "Air warmed near the floor expanded, became less dense and rose. Cooler, denser air sank to replace it, completing a convection current." }
        : { success, stars: 1, title: "The room has hot and cold zones", explanation: heaterPosition === "ceiling" ? "Warm air already rises, so a ceiling heater leaves cooler, denser air near the floor." : "Strengthen the circulation with a fan or open vent so moving air can spread energy." };
    }
    if (active === "radiation") {
      const success = metrics.habitatTemp <= 35;
      return success
        ? { success, stars: surface === "silver" && distance <= 2 ? 3 : 2, title: "Habitat protected", explanation: `${surfaces[surface].label} reflects much of the incoming radiation. Electromagnetic waves still cross the ${vacuum ? "vacuum" : "air"}, but less is absorbed.` }
        : { success, stars: 1, title: "Too much radiation absorbed", explanation: `${surfaces[surface].label} absorbs a large fraction of the incoming radiation. Try a shinier surface or increase the distance.` };
    }
    const success = orbitShield === "silver" && insulated && cabinFan;
    return success
      ? { success, stars: 3, title: "Thermal systems balanced", explanation: "The shield reflects radiation, insulation slows conduction through the hull, and the fan drives convection inside the cabin." }
      : { success, stars: 1, title: "One pathway is still leaking energy", explanation: "Control all three pathways: reflect radiation, slow conduction through the hull, and circulate cabin air by convection." };
  }, [active, metrics, handleMaterial, heaterPosition, fanOn, surface, distance, vacuum, orbitShield, insulated, cabinFan]);

  useEffect(() => {
    if (progress < 100 || !running) return;
    setRunning(false);
    setResult(outcome);
    if (outcome.success) setCompleted((current) => current.includes(active) ? current : [...current, active]);
  }, [progress, running, outcome, active]);

  function selectScenario(id: ScenarioId) {
    setActive(id);
    setProgress(0);
    setRunning(false);
    setResult(null);
  }

  function runExperiment() {
    setResult(null);
    setProgress(0);
    setRunning(true);
  }

  const activeScenario = scenarios.find((scenario) => scenario.id === active)!;
  const totalStars = completed.length * 3;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span>°</span></div>
          <div>
            <p className="eyebrow">Year 8 Science • 7.1.1</p>
            <h1>Heat Transfer Lab</h1>
          </div>
        </div>
        <div className="top-progress" aria-label={`${completed.length} of 4 missions complete`}>
          <span className="progress-label">Mission progress</span>
          <div className="progress-pips">
            {scenarios.map((scenario) => <span key={scenario.id} className={completed.includes(scenario.id) ? "pip complete" : "pip"} />)}
          </div>
          <span className="star-score">★ {totalStars}</span>
        </div>
      </header>

      <section className="mission-map" aria-label="Heat transfer mission environments">
        <img src="/heat-worlds.png" alt="A kitchen pan, a heated room and a sunlit space habitat—the three heat transfer environments" />
        <div className="mission-map-copy">
          <span className="status-dot" />
          <p><strong>Core rule:</strong> thermal energy transfers from warmer places to cooler places.</p>
        </div>
      </section>

      <div className="workspace">
        <nav className="mission-rail" aria-label="Simulation missions">
          <div className="rail-heading">
            <span>Experiments</span>
            <small>{completed.length}/4 complete</small>
          </div>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={`mission-card ${active === scenario.id ? "active" : ""} ${completed.includes(scenario.id) ? "done" : ""}`}
              style={{ "--mission-colour": scenario.colour } as React.CSSProperties}
              onClick={() => selectScenario(scenario.id)}
              aria-current={active === scenario.id ? "page" : undefined}
            >
              <span className="mission-icon" aria-hidden="true">{completed.includes(scenario.id) ? "✓" : scenario.icon}</span>
              <span className="mission-copy"><small>{scenario.number} • {scenario.subtitle}</small><strong>{scenario.title}</strong></span>
              <span className="mission-arrow" aria-hidden="true">›</span>
            </button>
          ))}
          <div className="legend-card">
            <span className="legend-title">Heat key</span>
            <div><i className="key-dot hot" /> Warmer</div>
            <div><i className="key-dot cool" /> Cooler</div>
            <div><i className="key-arrow">→</i> Energy flow</div>
          </div>
        </nav>

        <section className="lab-panel">
          <div className="lab-heading">
            <div>
              <p className="eyebrow">Mission {activeScenario.number}</p>
              <h2>{activeScenario.title}</h2>
              <p className="mission-brief">{missionBrief(active)}</p>
            </div>
            <div className="view-toggles" aria-label="Simulation view controls">
              <Toggle label="Thermal view" icon="◉" value={heatLens} onChange={setHeatLens} />
              <Toggle label="Particles" icon="⁙" value={particles} onChange={setParticles} />
            </div>
          </div>

          <div className={`sim-stage ${heatLens ? "heat-lens" : ""} ${running ? "is-running" : ""}`}>
            <div className="stage-toolbar">
              <span className="live-badge"><i /> {running ? "Simulation running" : progress === 100 ? "Experiment complete" : "Ready to test"}</span>
              <span className="method-badge">Dominant: <strong>{activeScenario.subtitle}</strong></span>
            </div>
            {active === "conduction" && <ConductionScene metrics={metrics} material={handleMaterial} power={burnerPower} particles={particles} progress={progress} />}
            {active === "convection" && <ConvectionScene metrics={metrics} position={heaterPosition} power={heaterPower} fanOn={fanOn} ventOpen={ventOpen} particles={particles} />}
            {active === "radiation" && <RadiationScene metrics={metrics} surface={surface} distance={distance} vacuum={vacuum} particles={particles} />}
            {active === "mastery" && <MasteryScene metrics={metrics} shield={orbitShield} insulated={insulated} fan={cabinFan} particles={particles} />}
            <div className="timeline" aria-label={`Experiment ${progress}% complete`}>
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="bottom-grid">
            <section className="control-card" aria-label="Experiment controls">
              <div className="card-title-row"><h3>Set up the experiment</h3><span>Change one variable, then run it</span></div>
              {active === "conduction" && <ConductionControls material={handleMaterial} setMaterial={setHandleMaterial} power={burnerPower} setPower={setBurnerPower} />}
              {active === "convection" && <ConvectionControls position={heaterPosition} setPosition={setHeaterPosition} power={heaterPower} setPower={setHeaterPower} fan={fanOn} setFan={setFanOn} vent={ventOpen} setVent={setVentOpen} />}
              {active === "radiation" && <RadiationControls surface={surface} setSurface={setSurface} distance={distance} setDistance={setDistance} vacuum={vacuum} setVacuum={setVacuum} />}
              {active === "mastery" && <MasteryControls shield={orbitShield} setShield={setOrbitShield} insulated={insulated} setInsulated={setInsulated} fan={cabinFan} setFan={setCabinFan} />}
              <button className="run-button" onClick={runExperiment} disabled={running}>
                <span>{running ? "Experiment in progress…" : progress === 100 ? "Run again" : "Run experiment"}</span>
                <i aria-hidden="true">{running ? "●" : "▶"}</i>
              </button>
            </section>

            <aside className={`insight-card ${result ? (result.success ? "success" : "retry") : ""}`} aria-live="polite">
              {result ? (
                <>
                  <div className="result-top">
                    <span className="result-icon">{result.success ? "✓" : "↺"}</span>
                    <div><small>{result.success ? "Mission complete" : "Try another setup"}</small><h3>{result.title}</h3></div>
                  </div>
                  <div className="stars" aria-label={`${result.stars} stars`}>{[1, 2, 3].map((star) => <span key={star} className={star <= result.stars ? "earned" : ""}>★</span>)}</div>
                  <p>{result.explanation}</p>
                  <div className="energy-rule"><span>Remember</span> Heat is energy <em>in transfer</em> because of a temperature difference.</div>
                </>
              ) : (
                <>
                  <div className="insight-icon" aria-hidden="true">⌁</div>
                  <small>Watch for this</small>
                  <h3>{watchFor(active)}</h3>
                  <p>{conceptCopy(active)}</p>
                  <div className="energy-rule"><span>Direction</span> Higher temperature <b>→</b> lower temperature</div>
                </>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Toggle({ label, icon, value, onChange }: { label: string; icon: string; value: boolean; onChange: (value: boolean) => void }) {
  return <button className={`toggle ${value ? "on" : ""}`} onClick={() => onChange(!value)} aria-pressed={value}><span>{icon}</span>{label}<i /></button>;
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; label: string }) {
  return <div className="field"><label>{label}</label><div className="segmented">{options.map((option) => <button key={option.value} className={value === option.value ? "selected" : ""} onClick={() => onChange(option.value)}>{option.label}</button>)}</div></div>;
}

function RangeControl({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (value: number) => void }) {
  return <div className="field range-field"><div className="range-label"><label>{label}</label><output>{value}{unit}</output></div><input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}

function ConductionControls({ material, setMaterial, power, setPower }: { material: keyof typeof materials; setMaterial: (v: keyof typeof materials) => void; power: number; setPower: (v: number) => void }) {
  return <div className="controls-stack"><Segmented value={material} label="Handle material" onChange={setMaterial} options={Object.entries(materials).map(([value, item]) => ({ value: value as keyof typeof materials, label: item.label }))} /><RangeControl label="Burner power" value={power} min={30} max={100} unit="%" onChange={setPower} /></div>;
}

function ConvectionControls({ position, setPosition, power, setPower, fan, setFan, vent, setVent }: { position: "floor" | "middle" | "ceiling"; setPosition: (v: "floor" | "middle" | "ceiling") => void; power: number; setPower: (v: number) => void; fan: boolean; setFan: (v: boolean) => void; vent: boolean; setVent: (v: boolean) => void }) {
  return <div className="controls-stack"><Segmented value={position} label="Heater position" onChange={setPosition} options={[{ value: "floor", label: "Floor" }, { value: "middle", label: "Middle" }, { value: "ceiling", label: "Ceiling" }]} /><RangeControl label="Heater power" value={power} min={35} max={100} unit="%" onChange={setPower} /><div className="inline-switches"><Toggle label="Circulation fan" icon="↻" value={fan} onChange={setFan} /><Toggle label="High vent" icon="↗" value={vent} onChange={setVent} /></div></div>;
}

function RadiationControls({ surface, setSurface, distance, setDistance, vacuum, setVacuum }: { surface: keyof typeof surfaces; setSurface: (v: keyof typeof surfaces) => void; distance: number; setDistance: (v: number) => void; vacuum: boolean; setVacuum: (v: boolean) => void }) {
  return <div className="controls-stack"><Segmented value={surface} label="Habitat surface" onChange={setSurface} options={Object.entries(surfaces).map(([value, item]) => ({ value: value as keyof typeof surfaces, label: item.label }))} /><RangeControl label="Distance from source" value={distance} min={1} max={4} unit="×" onChange={setDistance} /><div className="inline-switches"><Toggle label="Vacuum chamber" icon="○" value={vacuum} onChange={setVacuum} /></div></div>;
}

function MasteryControls({ shield, setShield, insulated, setInsulated, fan, setFan }: { shield: keyof typeof surfaces; setShield: (v: keyof typeof surfaces) => void; insulated: boolean; setInsulated: (v: boolean) => void; fan: boolean; setFan: (v: boolean) => void }) {
  return <div className="controls-stack"><Segmented value={shield} label="Outer shield" onChange={setShield} options={Object.entries(surfaces).map(([value, item]) => ({ value: value as keyof typeof surfaces, label: item.label }))} /><div className="inline-switches"><Toggle label="Hull insulation" icon="▦" value={insulated} onChange={setInsulated} /><Toggle label="Cabin fan" icon="↻" value={fan} onChange={setFan} /></div></div>;
}

type Metrics = { waterTemp: number; handleTemp: number; roomMean: number; roomSpread: number; habitatTemp: number; exteriorTemp: number; cabinTemp: number };

function TempTag({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return <div className={`temp-tag ${className}`}><span>{label}</span><strong>{Math.round(value)}°C</strong></div>;
}

function ConductionScene({ metrics, material, power, particles, progress }: { metrics: Metrics; material: keyof typeof materials; power: number; particles: boolean; progress: number }) {
  return <div className="scene conduction-scene">
    <div className="scene-copy"><span>CONDUCTION</span><strong>Energy is passed from particle to particle</strong></div>
    <TempTag label="Water" value={metrics.waterTemp} className="water-temp" /><TempTag label="Grip" value={metrics.handleTemp} className="handle-temp" />
    <div className="pot"><div className="water" style={{ opacity: 0.35 + progress / 200 }} /><div className="pot-rim" /><div className="pan-handle" style={{ background: materials[material].tone }}>{particles && Array.from({ length: 12 }).map((_, i) => <i key={i} className="solid-particle" style={{ "--i": i, "--heat": Math.max(0, progress / 10 - i) } as React.CSSProperties} />)}</div></div>
    <div className="burner"><div className="flame-ring" style={{ opacity: power / 100 }} /></div>
    <div className="bench" />
    <div className="transfer-label"><i>→</i> particle collisions transfer energy</div>
  </div>;
}

function ConvectionScene({ metrics, position, power, fanOn, ventOpen, particles }: { metrics: Metrics; position: "floor" | "middle" | "ceiling"; power: number; fanOn: boolean; ventOpen: boolean; particles: boolean }) {
  const bottom = { floor: "16%", middle: "45%", ceiling: "72%" }[position];
  return <div className="scene convection-scene">
    <div className="scene-copy"><span>CONVECTION</span><strong>Moving fluids carry thermal energy</strong></div>
    <TempTag label="Average" value={metrics.roomMean} className="room-temp" /><TempTag label="Difference" value={metrics.roomSpread} className="spread-temp" />
    <div className="window"><div className="moon" /></div><div className="floor-line" />
    <div className="heater" style={{ bottom, opacity: 0.45 + power / 180 }}><i /><i /><i /></div>
    <div className={`vent ${ventOpen ? "open" : ""}`}><i /><i /><i /></div>
    {fanOn && <div className="fan"><i>✣</i></div>}
    <div className="convection-loop"><span className="warm-arrow">↑ <b>warm rises</b></span><span className="top-arrow">→</span><span className="cool-arrow">↓ <b>cool sinks</b></span><span className="bottom-arrow">←</span></div>
    {particles && Array.from({ length: 18 }).map((_, i) => <i key={i} className={`air-particle ${i % 2 ? "warm" : "cool"}`} style={{ "--i": i } as React.CSSProperties} />)}
  </div>;
}

function RadiationScene({ metrics, surface, distance, vacuum, particles }: { metrics: Metrics; surface: keyof typeof surfaces; distance: number; vacuum: boolean; particles: boolean }) {
  return <div className="scene radiation-scene">
    <div className="scene-copy"><span>RADIATION</span><strong>Electromagnetic waves need no particles</strong></div>
    <div className="space-label">{vacuum ? "VACUUM • NO PARTICLES" : "AIR PRESENT"}</div><TempTag label="Habitat" value={metrics.habitatTemp} className="habitat-temp" />
    <div className="sun"><i /></div>
    <div className="radiant-path" style={{ width: `${44 + distance * 5}%` }}>{particles && Array.from({ length: 5 }).map((_, i) => <i key={i} className="rad-wave" style={{ "--i": i } as React.CSSProperties} />)}<span>radiant energy →</span></div>
    <div className="planet" />
    <div className="habitat" style={{ background: surfaces[surface].tone, right: `${7 - distance}%` }}><div className="habitat-window" /><div className="habitat-leg left" /><div className="habitat-leg right" /></div>
    <div className="reflection" style={{ opacity: 1 - surfaces[surface].absorption }}>↗ reflected</div>
  </div>;
}

function MasteryScene({ metrics, shield, insulated, fan, particles }: { metrics: Metrics; shield: keyof typeof surfaces; insulated: boolean; fan: boolean; particles: boolean }) {
  return <div className="scene mastery-scene">
    <div className="scene-copy"><span>MIXED SYSTEM</span><strong>Three pathways. One balanced habitat.</strong></div>
    <TempTag label="Outer hull" value={metrics.exteriorTemp} className="outer-temp" /><TempTag label="Cabin" value={metrics.cabinTemp} className="cabin-temp" />
    <div className="mini-sun" />
    <div className="master-radiation">{particles && <><i /><i /><i /></>}<span>RADIATION</span></div>
    <div className={`cutaway-habitat ${insulated ? "insulated" : ""}`} style={{ borderColor: surfaces[shield].tone }}>
      <div className="hull-layer"><span>CONDUCTION</span>{particles && Array.from({ length: 8 }).map((_, i) => <i key={i} />)}</div>
      <div className="cabin-loop"><span>CONVECTION</span><i className={fan ? "moving" : ""}>↻</i></div>
      <div className="crew-zone">Comfort zone<br /><strong>20–24°C</strong></div>
    </div>
    <div className="system-tags"><span className={shield === "silver" ? "active" : ""}>Reflect</span><span className={insulated ? "active" : ""}>Insulate</span><span className={fan ? "active" : ""}>Circulate</span></div>
  </div>;
}

function missionBrief(id: ScenarioId) {
  return {
    conduction: "Heat the soup to 68°C while keeping the handle below 43°C.",
    convection: "Bring the room to 22°C with less than 3.5°C difference between zones.",
    radiation: "Keep the sunlit habitat at or below 35°C—even in a vacuum.",
    mastery: "Use all three transfer methods to hold the cabin in its comfort zone.",
  }[id];
}

function watchFor(id: ScenarioId) {
  return {
    conduction: "Which material slows energy along the handle?",
    convection: "Where does the warmer, less-dense air move?",
    radiation: "Does removing the air stop the energy transfer?",
    mastery: "Can you control every pathway at once?",
  }[id];
}

function conceptCopy(id: ScenarioId) {
  return {
    conduction: "In a solid, faster-vibrating particles collide with neighbouring particles and pass thermal energy through the material.",
    convection: "Warm fluids expand and become less dense, so they rise. Cooler, denser fluid sinks and a current forms.",
    radiation: "All warm objects emit infrared radiation. These electromagnetic waves can travel through empty space.",
    mastery: "Real systems usually transfer energy in more than one way. Look for the dominant pathway in each part.",
  }[id];
}
