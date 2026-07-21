"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScenarioId = "conduction" | "convection" | "radiation" | "mastery";
type Result = { success: boolean; title: string; explanation: string; stars: number };
type Theme = "system" | "dark" | "light";
type TextScale = 1 | 1.15 | 1.3;
type InsulationLevel = "low" | "medium" | "high";
type FanLevel = "off" | "low" | "high";

const missionStories: Record<ScenarioId, { hook: string; why: string; goal: string; checklist: string[]; audio: string }> = {
  conduction: {
    hook: "Camp kitchen emergency",
    why: "A field team needs a hot meal, but the saucepan handle could burn the cook.",
    goal: "Heat the soup to at least 68°C while keeping the hand grip below 43°C.",
    checklist: ["Choose a handle material", "Set the burner power", "Use thermal or particle view as evidence"],
    audio: "/audio/mr-cisneros-conduction.mp3",
  },
  convection: {
    hook: "Warm a storm-battered cabin",
    why: "Warm air is collecting near the ceiling while the occupied zone stays cold.",
    goal: "Reach 22°C with less than 3.5°C difference between the warmest and coolest zones.",
    checklist: ["Position the heater", "Guide the airflow", "Watch warm air rise and cool air sink"],
    audio: "/audio/mr-cisneros-convection.mp3",
  },
  radiation: {
    hook: "Protect a habitat in space",
    why: "Intense sunlight is heating the crew module, and there is no air outside to carry energy away.",
    goal: "Keep the sunlit habitat at or below 35°C, including when the chamber is a vacuum.",
    checklist: ["Choose a surface finish", "Change the distance", "Compare air with a vacuum"],
    audio: "/audio/mr-cisneros-radiation.mp3",
  },
  mastery: {
    hook: "Polar rescue power failure",
    why: "A medical pod must stay safe through a sunlit phase and an icy eclipse using limited power.",
    goal: "Keep every pod zone near 20–24°C, limit temperature differences, and stay within 30 power units.",
    checklist: ["Control radiation at the outer shield", "Slow conduction through the walls", "Use convection to even out the air"],
    audio: "/audio/mr-cisneros-mastery.mp3",
  },
};

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [textScale, setTextScale] = useState<TextScale>(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [narrationPlaying, setNarrationPlaying] = useState(false);
  const [phasePrompt, setPhasePrompt] = useState(false);
  const [eclipseStarted, setEclipseStarted] = useState(false);
  const [sunPeak, setSunPeak] = useState(22);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  const [insulationLevel, setInsulationLevel] = useState<InsulationLevel>("medium");
  const [cabinFan, setCabinFan] = useState<FanLevel>("low");
  const [radiatorDeployed, setRadiatorDeployed] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("heat-lab-preferences");
      if (saved) {
        const preferences = JSON.parse(saved);
        if (["system", "dark", "light"].includes(preferences.theme)) setTheme(preferences.theme);
        if ([1, 1.15, 1.3].includes(preferences.textScale)) setTextScale(preferences.textScale);
        setReducedMotion(Boolean(preferences.reducedMotion));
        setAudioEnabled(Boolean(preferences.audioEnabled));
      } else {
        setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      }
    } catch { /* Keep accessible defaults when storage is unavailable. */ }
  }, []);

  useEffect(() => {
    const resolvedTheme = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : theme;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.setProperty("--text-scale", String(textScale));
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    window.localStorage.setItem("heat-lab-preferences", JSON.stringify({ theme, textScale, reducedMotion, audioEnabled }));
  }, [theme, textScale, reducedMotion, audioEnabled]);

  useEffect(() => () => audioRef.current?.pause(), []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (active === "mastery" && current >= 54 && !eclipseStarted) {
          const conductance = { low: 1, medium: 0.55, high: 0.28 }[insulationLevel];
          const peak = 22 + 12 * surfaces[orbitShield].absorption * conductance - (radiatorDeployed ? 5 : 0);
          setSunPeak(peak);
          setEclipseStarted(true);
          setPhasePrompt(true);
          setRunning(false);
          window.clearInterval(timer);
          return 55;
        }
        if (current >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return current + 2;
      });
    }, 70);
    return () => window.clearInterval(timer);
  }, [running, active, eclipseStarted, insulationLevel, orbitShield, radiatorDeployed]);

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
    const conductance = { low: 1, medium: 0.55, high: 0.28 }[insulationLevel];
    const isSunlit = progress < 55;
    const exteriorTemp = isSunlit ? 16 + 62 * orbitAbsorption * fraction * 1.8 : 2 + 16 * conductance;
    const orbitLow = 22 - 7 * conductance - (radiatorDeployed ? 3 : 0);
    const cabinTemp = isSunlit
      ? 22 + 12 * orbitAbsorption * conductance * (fraction / 0.55) - (radiatorDeployed ? 5 : 0)
      : 22 + (orbitLow - 22) * ((fraction - 0.55) / 0.45);
    const zoneSpread = { off: 5.8, low: 2.8, high: 1.2 }[cabinFan];
    const powerUse = { off: 0, low: 8, high: 16 }[cabinFan] + (radiatorDeployed ? 20 : 0);

    return { waterTemp, handleTemp, roomMean, roomSpread, habitatTemp, exteriorTemp, cabinTemp, zoneSpread, powerUse, orbitLow, isSunlit };
  }, [progress, handleMaterial, burnerPower, heaterPosition, heaterPower, fanOn, ventOpen, surface, distance, orbitShield, insulationLevel, cabinFan, radiatorDeployed]);

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
    const success = sunPeak <= 24.5 && metrics.orbitLow >= 19 && metrics.zoneSpread <= 4;
    return success
      ? { success, stars: metrics.powerUse <= 30 ? 3 : 2, title: "Medical pod protected", explanation: `You balanced the system: radiation control limited the sunlit peak to ${sunPeak.toFixed(1)}°C, insulation slowed conduction, and the fan reduced zone differences by convection.` }
      : { success, stars: 1, title: "One phase left the pod unsafe", explanation: sunPeak > 24.5 ? "The pod became too warm in sunlight. Reflect more radiation or deploy the radiator before eclipse." : metrics.orbitLow < 19 ? "The pod cooled too far in eclipse. Stow the radiator and strengthen the insulation." : "The average is safe, but the air has uneven hot and cold zones. Increase the cabin fan." };
  }, [active, metrics, handleMaterial, heaterPosition, fanOn, surface, distance, vacuum, sunPeak]);

  useEffect(() => {
    if (progress < 100 || !running) return;
    setRunning(false);
    setResult(outcome);
    playEffect(outcome.success ? "success" : "retry");
    if (outcome.success) setCompleted((current) => current.includes(active) ? current : [...current, active]);
  }, [progress, running, outcome, active]);

  function selectScenario(id: ScenarioId) {
    audioRef.current?.pause();
    setNarrationPlaying(false);
    setActive(id);
    setProgress(0);
    setRunning(false);
    setResult(null);
    setGoalOpen(true);
    setSupportOpen(false);
    setPhasePrompt(false);
    setEclipseStarted(false);
    setSunPeak(22);
    playEffect("switch");
  }

  function runExperiment() {
    setResult(null);
    if (progress >= 100 || progress === 0) {
      setProgress(0);
      setEclipseStarted(false);
      setSunPeak(22);
    }
    setRunning(true);
    playEffect("run");
  }

  function resumeEclipse() {
    setPhasePrompt(false);
    setRunning(true);
    playEffect("switch");
  }

  function playEffect(kind: "run" | "success" | "retry" | "switch") {
    if (!audioEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const frequencies = { run: [220, 420], success: [440, 740], retry: [180, 130], switch: [320, 380] }[kind];
      oscillator.type = kind === "retry" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequencies[0], context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], context.currentTime + 0.18);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.23);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.24);
    } catch { /* Sound remains optional. */ }
  }

  function playNarration() {
    audioRef.current?.pause();
    if (narrationPlaying) {
      setNarrationPlaying(false);
      return;
    }
    setAudioEnabled(true);
    const audio = new Audio(missionStories[active].audio);
    audioRef.current = audio;
    audio.onended = () => setNarrationPlaying(false);
    audio.onerror = () => setNarrationPlaying(false);
    audio.play().then(() => setNarrationPlaying(true)).catch(() => setNarrationPlaying(false));
  }

  const activeScenario = scenarios.find((scenario) => scenario.id === active)!;
  const totalStars = completed.length * 3;

  return (
    <main className="app-shell" data-theme-choice={theme}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span>°</span></div>
          <div>
            <p className="eyebrow">Year 8 Science • 7.1.1</p>
            <h1>Heat Transfer Lab</h1>
          </div>
        </div>
        <div className="top-actions">
          <div className="top-progress" aria-label={`${completed.length} of 4 missions complete`}>
            <span className="progress-label">Mission progress</span>
            <div className="progress-pips">
              {scenarios.map((scenario) => <span key={scenario.id} className={completed.includes(scenario.id) ? "pip complete" : "pip"} />)}
            </div>
            <span className="star-score">★ {totalStars}</span>
          </div>
          <button className="utility-button" onClick={() => setAudioEnabled(!audioEnabled)} aria-pressed={audioEnabled} aria-label={audioEnabled ? "Turn sound off" : "Turn sound on"}>{audioEnabled ? "🔊" : "🔇"}<span>Sound</span></button>
          <button className="utility-button" onClick={() => setSettingsOpen(true)}><span aria-hidden="true">Aa</span><span>Accessibility</span></button>
        </div>
      </header>

      <section className="mission-map" aria-label="Heat transfer mission environments">
        <img src="/heat-worlds.png" alt="A kitchen pan, a heated room and a sunlit space habitat—the three heat transfer environments" />
        <div className="mission-map-copy">
          <span className="status-dot" />
          <p><strong>Your mission:</strong> use evidence to move thermal energy safely from warmer places to cooler places.</p>
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
              <p className="mission-brief"><strong>{missionStories[active].hook}:</strong> {missionStories[active].why}</p>
            </div>
            <div className="view-toggles" aria-label="Simulation view controls">
              <button className="goal-button" onClick={() => setGoalOpen(true)}>◎ Mission goal</button>
              <button className="goal-button" onClick={playNarration}>{narrationPlaying ? "■ Stop audio" : "▶ Listen"}</button>
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
            {active === "mastery" && <MasteryScene metrics={metrics} shield={orbitShield} insulation={insulationLevel} fan={cabinFan} radiator={radiatorDeployed} particles={particles} progress={progress} />}
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
              {active === "mastery" && <MasteryControls shield={orbitShield} setShield={setOrbitShield} insulation={insulationLevel} setInsulation={setInsulationLevel} fan={cabinFan} setFan={setCabinFan} radiator={radiatorDeployed} setRadiator={setRadiatorDeployed} />}
              <button className="support-button" onClick={() => setSupportOpen(!supportOpen)} aria-expanded={supportOpen}>? {supportOpen ? "Hide mission support" : "Show mission support"}</button>
              {supportOpen && <div className="support-panel"><strong>Try this strategy</strong><ol>{missionStories[active].checklist.map((item) => <li key={item}>{item}</li>)}</ol><p>You can pause, change a setting and test again. There is no penalty for exploring.</p></div>}
              <button className="run-button" onClick={runExperiment} disabled={running}>
                <span>{running ? "Experiment in progress…" : progress === 55 && active === "mastery" ? "Continue into eclipse" : progress === 100 ? "Run again" : "Run experiment"}</span>
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

      {goalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="mission-modal" role="dialog" aria-modal="true" aria-labelledby="mission-modal-title">
            <div className="modal-kicker"><span>{activeScenario.icon}</span> Mission {activeScenario.number} • {activeScenario.subtitle}</div>
            <h2 id="mission-modal-title">{missionStories[active].hook}</h2>
            <p className="modal-story">{missionStories[active].why}</p>
            <div className="goal-callout"><small>Your goal</small><strong>{missionStories[active].goal}</strong></div>
            <ul className="mission-checklist">{missionStories[active].checklist.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>
            <div className="modal-actions">
              <button className="secondary-action" onClick={playNarration}>{narrationPlaying ? "■ Stop Mr. Cisneros" : "▶ Listen with Mr. Cisneros"}</button>
              <button className="primary-action" onClick={() => { setGoalOpen(false); playEffect("switch"); }}>Start mission <span>→</span></button>
            </div>
            <p className="choice-note">Choose the views and supports that work best for you. You can replay without penalty.</p>
          </section>
        </div>
      )}

      {phasePrompt && (
        <div className="modal-backdrop" role="presentation">
          <section className="mission-modal phase-modal" role="dialog" aria-modal="true" aria-labelledby="phase-title">
            <div className="modal-kicker"><span>❄</span> Environment change</div>
            <h2 id="phase-title">Eclipse incoming</h2>
            <p className="modal-story">Sunlight has disappeared. The radiator that helped in sunlight may now cool the pod too far.</p>
            <div className="goal-callout"><small>Sunlit peak</small><strong>{sunPeak.toFixed(1)}°C • Target was 24.5°C or lower</strong></div>
            <p className="phase-advice">Adjust the radiator, insulation or fan before continuing. A fan redistributes energy—it does not remove it.</p>
            <div className="modal-actions"><button className="primary-action" onClick={resumeEclipse}>Continue into eclipse <span>→</span></button></div>
          </section>
        </div>
      )}

      {settingsOpen && (
        <div className="settings-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <aside className="settings-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="settings-heading"><div><p className="eyebrow">Choose what helps you learn</p><h2 id="settings-title">Accessibility</h2></div><button className="close-button" onClick={() => setSettingsOpen(false)} aria-label="Close accessibility settings">×</button></div>
            <p className="settings-intro">Your choices are saved on this device. Colour is always paired with labels, values and motion.</p>
            <Segmented value={theme} label="Colour theme" onChange={setTheme} options={[{ value: "system", label: "System" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
            <Segmented value={textScale} label="Text size" onChange={setTextScale} options={[{ value: 1, label: "Standard" }, { value: 1.15, label: "Large" }, { value: 1.3, label: "Extra large" }]} />
            <div className="settings-options">
              <Toggle label="Reduce movement" icon="◫" value={reducedMotion} onChange={setReducedMotion} />
              <Toggle label="Sound effects" icon="♫" value={audioEnabled} onChange={setAudioEnabled} />
            </div>
            <div className="udl-note"><strong>Designed for learner agency</strong><span>Choose audio, text size, theme, views, hints and pace. Every mission has a clear purpose and multiple ways to notice the science.</span></div>
            <button className="primary-action full" onClick={() => setSettingsOpen(false)}>Save and return</button>
          </aside>
        </div>
      )}
    </main>
  );
}

function Toggle({ label, icon, value, onChange }: { label: string; icon: string; value: boolean; onChange: (value: boolean) => void }) {
  return <button className={`toggle ${value ? "on" : ""}`} onClick={() => onChange(!value)} aria-pressed={value}><span>{icon}</span>{label}<i /></button>;
}

function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; label: string }) {
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

function MasteryControls({ shield, setShield, insulation, setInsulation, fan, setFan, radiator, setRadiator }: { shield: keyof typeof surfaces; setShield: (v: keyof typeof surfaces) => void; insulation: InsulationLevel; setInsulation: (v: InsulationLevel) => void; fan: FanLevel; setFan: (v: FanLevel) => void; radiator: boolean; setRadiator: (v: boolean) => void }) {
  return <div className="controls-stack mastery-controls">
    <Segmented value={shield} label="Outer shield • controls radiation" onChange={setShield} options={Object.entries(surfaces).map(([value, item]) => ({ value: value as keyof typeof surfaces, label: item.label }))} />
    <Segmented value={insulation} label="Wall insulation • slows conduction" onChange={setInsulation} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
    <Segmented value={fan} label="Cabin fan • evens convection" onChange={setFan} options={[{ value: "off", label: "Off" }, { value: "low", label: "Low" }, { value: "high", label: "High" }]} />
    <div className="inline-switches"><Toggle label="Radiator panel" icon="▤" value={radiator} onChange={setRadiator} /></div>
  </div>;
}

type Metrics = { waterTemp: number; handleTemp: number; roomMean: number; roomSpread: number; habitatTemp: number; exteriorTemp: number; cabinTemp: number; zoneSpread: number; powerUse: number; orbitLow: number; isSunlit: boolean };

function TempTag({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return <div className={`temp-tag ${className}`}><span>{label}</span><strong>{Math.round(value)}°C</strong></div>;
}

function ConductionScene({ metrics, material, power, particles, progress }: { metrics: Metrics; material: keyof typeof materials; power: number; particles: boolean; progress: number }) {
  return <div className="scene conduction-scene">
    <div className="scene-copy"><span>CONDUCTION</span><strong>Energy is passed from particle to particle</strong></div>
    <TempTag label="Water" value={metrics.waterTemp} className="water-temp" /><TempTag label="Grip" value={metrics.handleTemp} className="handle-temp" />
    <div className="model-flame-glow" style={{ opacity: power / 100 }} />
    <div className="model-handle-path" style={{ "--material": materials[material].tone } as React.CSSProperties}>{particles && Array.from({ length: 13 }).map((_, i) => <i key={i} className="solid-particle" style={{ "--i": i, "--heat": Math.max(0, progress / 9 - i) } as React.CSSProperties} />)}</div>
    <div className="transfer-label"><i>→</i> collisions pass energy along the solid</div>
  </div>;
}

function ConvectionScene({ metrics, position, power, fanOn, ventOpen, particles }: { metrics: Metrics; position: "floor" | "middle" | "ceiling"; power: number; fanOn: boolean; ventOpen: boolean; particles: boolean }) {
  const bottom = { floor: "16%", middle: "45%", ceiling: "72%" }[position];
  return <div className="scene convection-scene">
    <div className="scene-copy"><span>CONVECTION</span><strong>Moving fluids carry thermal energy</strong></div>
    <TempTag label="Average" value={metrics.roomMean} className="room-temp" /><TempTag label="Difference" value={metrics.roomSpread} className="spread-temp" />
    <div className="heater-beacon" style={{ bottom, opacity: 0.45 + power / 180 }}><span>HEATER</span></div>
    <div className={`vent-state ${ventOpen ? "open" : ""}`}>{ventOpen ? "VENT OPEN" : "VENT CLOSED"}</div>
    {fanOn && <div className="fan"><i>✣</i></div>}
    <div className="convection-loop"><span className="warm-arrow">↑ <b>warm rises</b></span><span className="top-arrow">→</span><span className="cool-arrow">↓ <b>cool sinks</b></span><span className="bottom-arrow">←</span></div>
    {particles && Array.from({ length: 18 }).map((_, i) => <i key={i} className={`air-particle ${i % 2 ? "warm" : "cool"}`} style={{ "--i": i } as React.CSSProperties} />)}
  </div>;
}

function RadiationScene({ metrics, surface, distance, vacuum, particles }: { metrics: Metrics; surface: keyof typeof surfaces; distance: number; vacuum: boolean; particles: boolean }) {
  return <div className="scene radiation-scene">
    <div className="scene-copy"><span>RADIATION</span><strong>Electromagnetic waves need no particles</strong></div>
    <div className="space-label">{vacuum ? "VACUUM • NO PARTICLES" : "AIR PRESENT"}</div><TempTag label="Habitat" value={metrics.habitatTemp} className="habitat-temp" />
    <div className="radiant-path" style={{ width: `${44 + distance * 5}%` }}>{particles && Array.from({ length: 6 }).map((_, i) => <i key={i} className="rad-wave" style={{ "--i": i } as React.CSSProperties} />)}<span>radiant energy travels through {vacuum ? "empty space" : "air"} →</span></div>
    <div className="shield-panel" style={{ background: surfaces[surface].tone, transform: `translateX(${distance * 10}px) rotateY(-18deg)` }}><span>{surfaces[surface].label}</span></div>
    <div className="reflection" style={{ opacity: 1 - surfaces[surface].absorption }}>↗ reflected</div>
  </div>;
}

function MasteryScene({ metrics, shield, insulation, fan, radiator, particles, progress }: { metrics: Metrics; shield: keyof typeof surfaces; insulation: InsulationLevel; fan: FanLevel; radiator: boolean; particles: boolean; progress: number }) {
  return <div className="scene mastery-scene">
    <div className="scene-copy"><span>MIXED CHALLENGE</span><strong>Protect the medical pod through sunlight and eclipse</strong></div>
    <div className={`phase-chip ${metrics.isSunlit ? "sunlit" : "eclipse"}`}>{metrics.isSunlit ? "☀ SUNLIGHT" : "❄ ECLIPSE"} • {Math.round(progress)}%</div>
    <TempTag label="Outside" value={metrics.exteriorTemp} className="outer-temp" /><TempTag label="Pod average" value={metrics.cabinTemp} className="cabin-temp" />
    <div className="mixed-readouts"><span>Zone difference <strong>{metrics.zoneSpread.toFixed(1)}°C</strong></span><span>Power <strong>{metrics.powerUse}/30</strong></span></div>
    <div className="pod-shield" style={{ borderColor: surfaces[shield].tone }}><span>{surfaces[shield].label}</span></div>
    <div className={`wall-conduction insulation-${insulation}`}>{particles && Array.from({ length: 7 }).map((_, i) => <i key={i} />)}<span>CONDUCTION</span></div>
    <div className={`pod-convection fan-${fan}`}><i>↻</i><span>CONVECTION</span></div>
    <div className={`radiator-model ${radiator ? "deployed" : ""}`}><span>RADIATOR</span></div>
    <div className="system-tags"><span className={shield === "silver" || shield === "white" ? "active" : ""}>Radiation</span><span className={insulation === "high" ? "active" : ""}>Conduction</span><span className={fan !== "off" ? "active" : ""}>Convection</span></div>
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
