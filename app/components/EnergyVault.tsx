"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateChemical,
  calculateElastic,
  calculateGravitational,
  calculateKinetic,
  calculateThermal,
  evaluateVault,
  normaliseRelative,
  type StoreId,
} from "@/src/energy-stores/engine.mjs";
import { ENERGY_STORE_MISSIONS, getEnergyStoreMission, type EnergyStoreMissionId } from "@/src/energy-stores/content";
import { assetPath } from "@/src/asset-path";
import styles from "./EnergyVault.module.css";

type Theme = "system" | "dark" | "light";
type TextScale = 1 | 1.15 | 1.3;
type Lens = "motion" | "system" | "particle";
type Result = { success: boolean; title: string; explanation: string; stars: number };

const missionIcons: Record<EnergyStoreMissionId, string> = {
  kinetic: "➜", gravitational: "↥", elastic: "⌁", thermal: "∿", chemical: "⬡", vault: "✦",
};
const missionColours: Record<EnergyStoreMissionId, string> = {
  kinetic: "#55cfea", gravitational: "#9b8cff", elastic: "#ffb547", thermal: "#ff6b4a", chemical: "#57d38c", vault: "#f17fd4",
};
const narration: Record<EnergyStoreMissionId, string> = {
  kinetic: assetPath("/audio/mr-cisneros-energy-kinetic.mp3"),
  gravitational: assetPath("/audio/mr-cisneros-energy-gravitational.mp3"),
  elastic: assetPath("/audio/mr-cisneros-energy-elastic.mp3"),
  thermal: assetPath("/audio/mr-cisneros-energy-thermal.mp3"),
  chemical: assetPath("/audio/mr-cisneros-energy-chemical.mp3"),
  vault: assetPath("/audio/mr-cisneros-energy-vault.mp3"),
};

const storeChoices: Array<{ id: StoreId | "heating" | "radiation"; label: string; clue: string }> = [
  { id: "kinetic", label: "Kinetic", clue: "moving rover" },
  { id: "gravitational", label: "Gravitational", clue: "raised crate + Earth" },
  { id: "elastic", label: "Elastic", clue: "stretched rescue line" },
  { id: "thermal", label: "Thermal", clue: "warm vaccine pod" },
  { id: "chemical", label: "Chemical", clue: "charged battery" },
  { id: "heating", label: "Heating", clue: "a transfer pathway" },
  { id: "radiation", label: "Radiation", clue: "a transfer pathway" },
];

const clampPercent = (value: number) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

export default function EnergyVault() {
  const [active, setActive] = useState<EnergyStoreMissionId>("kinetic");
  const [completed, setCompleted] = useState<EnergyStoreMissionId[]>([]);
  const [goalOpen, setGoalOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lens, setLens] = useState<Record<Lens, boolean>>({ motion: true, system: true, particle: false });
  const [theme, setTheme] = useState<Theme>("system");
  const [textScale, setTextScale] = useState<TextScale>(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [narrationPlaying, setNarrationPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [mass, setMass] = useState(6);
  const [speed, setSpeed] = useState(5);
  const [height, setHeight] = useState(6);
  const [stiffness, setStiffness] = useState(7);
  const [stretch, setStretch] = useState(6);
  const [thermalMass, setThermalMass] = useState(4);
  const [temperature, setTemperature] = useState(60);
  const [material, setMaterial] = useState<"water" | "oil" | "metal">("water");
  const [amount, setAmount] = useState(5);
  const [reserve, setReserve] = useState<"battery" | "fuel" | "food">("battery");
  const [vaultSelected, setVaultSelected] = useState<string[]>([]);

  const mission = getEnergyStoreMission(active);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("heat-lab-preferences");
        if (saved) {
          const preferences = JSON.parse(saved);
          if (["system", "dark", "light"].includes(preferences.theme)) setTheme(preferences.theme);
          if ([1, 1.15, 1.3].includes(preferences.textScale)) setTextScale(preferences.textScale);
          setReducedMotion(Boolean(preferences.reducedMotion));
          setAudioEnabled(Boolean(preferences.audioEnabled));
        } else setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      } catch { /* Accessible defaults remain active. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : theme;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.setProperty("--text-scale", String(textScale));
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    window.localStorage.setItem("heat-lab-preferences", JSON.stringify({ theme, textScale, reducedMotion, audioEnabled }));
  }, [theme, textScale, reducedMotion, audioEnabled]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const values = useMemo(() => {
    const materialFactor = { water: 1, oil: 0.65, metal: 0.45 }[material];
    const reserveFactor = { battery: 1, fuel: 0.8, food: 0.45 }[reserve];
    const raw = {
      kinetic: calculateKinetic({ massKg: mass, speedMps: speed }),
      gravitational: calculateGravitational({ massKg: mass, heightM: height }),
      elastic: calculateElastic({ stiffness, stretch }),
      thermal: calculateThermal({ massKg: thermalMass, specificHeatFactor: materialFactor, temperatureC: temperature }),
      chemical: calculateChemical({ amount, typeFactor: reserveFactor }),
    };
    return {
      raw,
      relative: {
        kinetic: normaliseRelative(raw.kinetic, 196),
        gravitational: normaliseRelative(raw.gravitational, 1176),
        elastic: normaliseRelative(raw.elastic, 320),
        thermal: normaliseRelative(raw.thermal, 640),
        chemical: normaliseRelative(raw.chemical, 10),
      },
    };
  }, [mass, speed, height, stiffness, stretch, thermalMass, temperature, material, amount, reserve]);

  const currentRelative = active === "vault" ? 0 : values.relative[active];
  const vaultOutcome = evaluateVault({ selected: vaultSelected, expected: ["kinetic", "gravitational", "elastic", "thermal", "chemical"] });

  function playEffect(kind: "scan" | "success" | "retry" | "switch") {
    if (!audioEnabled) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "success" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(kind === "success" ? 520 : kind === "retry" ? 180 : kind === "switch" ? 310 : 240, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "success" ? 820 : kind === "scan" ? 520 : 230, context.currentTime + .16);
    gain.gain.setValueAtTime(.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.09, context.currentTime + .015);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + .21);
  }

  function chooseMission(id: EnergyStoreMissionId) {
    audioRef.current?.pause();
    setNarrationPlaying(false); setActive(id); setResult(null); setGoalOpen(true); playEffect("switch");
  }

  function toggleNarration() {
    if (narrationPlaying) { audioRef.current?.pause(); setNarrationPlaying(false); return; }
    setAudioEnabled(true);
    const audio = new Audio(narration[active]);
    audioRef.current = audio;
    audio.onended = () => setNarrationPlaying(false);
    audio.onerror = () => setNarrationPlaying(false);
    audio.play().then(() => setNarrationPlaying(true)).catch(() => setNarrationPlaying(false));
  }

  function runScan() {
    setScanning(true); setResult(null); playEffect("scan");
    window.setTimeout(() => {
      let next: Result;
      if (active === "vault") {
        next = vaultOutcome.correct
          ? { success: true, stars: 3, title: "Every vault restored", explanation: "You found all five energy stores and kept heating and radiation separate as transfer pathways." }
          : { success: false, stars: vaultOutcome.stars, title: "The scan found a mismatch", explanation: vaultOutcome.feedback };
      } else {
        const success = currentRelative >= .28 && currentRelative <= .68;
        next = success
          ? { success: true, stars: currentRelative >= .38 && currentRelative <= .58 ? 3 : 2, title: "System stabilised", explanation: mission.feedback.success }
          : { success: false, stars: 1, title: currentRelative < .28 ? "The store is too low" : "The store is overloaded", explanation: mission.feedback.retry };
      }
      setScanning(false); setResult(next); playEffect(next.success ? "success" : "retry");
      if (next.success) setCompleted((items) => items.includes(active) ? items : [...items, active]);
    }, reducedMotion ? 160 : 680);
  }

  return <main className={styles.app} style={{ "--mission": missionColours[active] } as React.CSSProperties}>
    <header className={styles.topbar}>
      <div className={styles.brandRow}>
        <Link className={styles.back} href="/play" aria-label="Back to ChangeLab outcomes">←</Link>
        <div className={styles.brandMark} aria-hidden="true">∆</div>
        <div><p>ChangeLab · 7.1.2</p><h1>Energy Stores</h1></div>
      </div>
      <div className={styles.topProgress} aria-label={`${completed.length} of 6 missions complete`}>
        <span>{completed.length}/6 restored</span>
        <div>{ENERGY_STORE_MISSIONS.map((item) => <i key={item.id} className={completed.includes(item.id) ? styles.done : ""} />)}</div>
        <button className={styles.iconButton} onClick={() => setSettingsOpen(true)} aria-label="Open access settings">Aa</button>
      </div>
    </header>

    <section className={styles.storyStrip} aria-label="Mission setting">
      <div className={styles.storyCopy}><span className={styles.statusDot} /><p><strong>Storm Station 08</strong> · Energy systems unstable. Restore each store before backup power expires.</p></div>
      <span>Emergency model · Relative values</span>
    </section>

    <div className={styles.workspace}>
      <aside className={styles.rail} aria-label="Energy store missions">
        <p className={styles.railTitle}>Restore sequence <span>Choose any</span></p>
        {ENERGY_STORE_MISSIONS.map((item) => <button
          key={item.id}
          className={`${styles.missionButton} ${active === item.id ? styles.active : ""} ${completed.includes(item.id) ? styles.complete : ""}`}
          onClick={() => chooseMission(item.id)}
          style={{ "--item-colour": missionColours[item.id] } as React.CSSProperties}
          aria-current={active === item.id ? "step" : undefined}
        >
          <span className={styles.missionIcon}>{completed.includes(item.id) ? "✓" : missionIcons[item.id]}</span>
          <span><small>{item.number} · {item.storeLabel}</small><strong>{item.title}</strong></span>
          <b aria-hidden="true">›</b>
        </button>)}
        <div className={styles.modelKey}><strong>Model key</strong><span><i className={styles.energyDot} /> Energy store</span><span><i className={styles.boundaryDot} /> System boundary</span><p>Bars compare setups. They are not measured values.</p></div>
      </aside>

      <section className={styles.lab}>
        <div className={styles.labHeading}>
          <div><p className={styles.kicker}>Mission {mission.number} · {mission.storeLabel}</p><h2>{mission.title}</h2><p>{mission.hook}</p></div>
          <div className={styles.lenses} aria-label="Evidence lenses">
            {(["motion", "system", "particle"] as Lens[]).map((item) => <button key={item} onClick={() => setLens((current) => ({ ...current, [item]: !current[item] }))} className={lens[item] ? styles.on : ""} aria-pressed={lens[item]}><span>{item === "motion" ? "↗" : item === "system" ? "□" : "••"}</span>{item}</button>)}
          </div>
        </div>

        <div className={`${styles.stage} ${styles[active]} ${scanning ? styles.scanning : ""}`}>
          <div className={styles.stageChrome}><span><i /> Live system</span><span>{lens.system ? "System boundary visible" : "Evidence model"}</span></div>
          <Scene mission={active} lens={lens} mass={mass} speed={speed} height={height} stretch={stretch} temperature={temperature} material={material} amount={amount} reserve={reserve} relative={currentRelative} />
          {active !== "vault" && <div className={styles.energyHud}>
            <span>Relative store</span><strong>{Math.round(currentRelative * 100)}</strong><div><i style={{ width: clampPercent(currentRelative) }} /></div><small>Safe zone 28–68</small>
          </div>}
          <div className={styles.scanLine} />
        </div>

        <div className={styles.bottomGrid}>
          <section className={styles.controls} aria-label="Simulation controls">
            <div className={styles.cardHeading}><div><small>Control deck</small><h3>Change the system</h3></div><button onClick={() => setGoalOpen(true)}>Mission brief</button></div>
            <MissionControls active={active} mass={mass} setMass={setMass} speed={speed} setSpeed={setSpeed} height={height} setHeight={setHeight} stiffness={stiffness} setStiffness={setStiffness} stretch={stretch} setStretch={setStretch} thermalMass={thermalMass} setThermalMass={setThermalMass} temperature={temperature} setTemperature={setTemperature} material={material} setMaterial={setMaterial} amount={amount} setAmount={setAmount} reserve={reserve} setReserve={setReserve} vaultSelected={vaultSelected} setVaultSelected={setVaultSelected} />
            <button className={styles.scanButton} onClick={runScan} disabled={scanning}><span>{scanning ? "Scanning system…" : active === "vault" ? "Run vault scan" : "Test this setup"}</span><b>{scanning ? "···" : "→"}</b></button>
          </section>

          <aside className={`${styles.insight} ${result?.success ? styles.success : result ? styles.retry : ""}`} aria-live="polite">
            {result ? <><div className={styles.resultIcon}>{result.success ? "✓" : "↺"}</div><small>System scan</small><h3>{result.title}</h3><p>{result.explanation}</p><div className={styles.stars}>{[1,2,3].map((star) => <span key={star} className={star <= result.stars ? styles.earned : ""}>★</span>)}</div></> : <><div className={styles.resultIcon}>◎</div><small>Mr. Cisneros&apos;s field note</small><h3>Look for a pattern</h3><p>{mission.feedback.scienceNote}</p></>}
          </aside>
        </div>
      </section>
    </div>

    {goalOpen && <div className={styles.modalLayer} role="presentation"><section className={styles.goalModal} role="dialog" aria-modal="true" aria-labelledby="mission-title">
      <button className={styles.modalClose} onClick={() => setGoalOpen(false)} aria-label="Close mission briefing">×</button>
      <span className={styles.modalIcon}>{missionIcons[active]}</span><p className={styles.kicker}>Incoming mission · {mission.number}</p><h2 id="mission-title">{mission.hook}</h2>
      <p className={styles.modalWhy}>{mission.goal}</p>
      <div className={styles.briefList}>{mission.checklist.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>
      <div className={styles.modalActions}><button className={styles.listenButton} onClick={toggleNarration}>{narrationPlaying ? "Pause Mr. Cisneros" : "▶ Hear Mr. Cisneros"}</button><button className={styles.primaryButton} onClick={() => setGoalOpen(false)}>Enter simulation →</button></div>
    </section></div>}

    {settingsOpen && <div className={styles.modalLayer} role="presentation"><section className={styles.settingsModal} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <button className={styles.modalClose} onClick={() => setSettingsOpen(false)} aria-label="Close access settings">×</button><p className={styles.kicker}>UDL access layer</p><h2 id="settings-title">Make the lab work for you</h2>
      <div className={styles.setting}><div><strong>Colour theme</strong><small>Choose comfortable contrast.</small></div><div className={styles.segmented}>{(["system","dark","light"] as Theme[]).map((item) => <button key={item} className={theme === item ? styles.selected : ""} onClick={() => setTheme(item)}>{item}</button>)}</div></div>
      <div className={styles.setting}><div><strong>Text size</strong><small>Increase all interface text.</small></div><div className={styles.segmented}>{([1,1.15,1.3] as TextScale[]).map((item, index) => <button key={item} className={textScale === item ? styles.selected : ""} onClick={() => setTextScale(item)}>{["Default","Large","Largest"][index]}</button>)}</div></div>
      <label className={styles.switchRow}><span><strong>Reduce motion</strong><small>Keep evidence visible without movement.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /></label>
      <label className={styles.switchRow}><span><strong>Sound and narration</strong><small>Enable feedback sounds and mission audio.</small></span><input type="checkbox" checked={audioEnabled} onChange={(event) => setAudioEnabled(event.target.checked)} /></label>
      <button className={styles.primaryButton} onClick={() => setSettingsOpen(false)}>Save and return</button>
    </section></div>}
  </main>;
}

function Scene({ mission, lens, mass, speed, height, stretch, temperature, material, amount, reserve, relative }: { mission: EnergyStoreMissionId; lens: Record<Lens, boolean>; mass: number; speed: number; height: number; stretch: number; temperature: number; material: string; amount: number; reserve: string; relative: number }) {
  if (mission === "vault") return <div className={styles.vaultScene}>
    <div className={styles.station}><div className={styles.stationCore}>ENERGY<br /><strong>VAULT</strong><i /></div></div>
    <div className={`${styles.miniSystem} ${styles.roverMini}`}><span>➜</span><b>Moving rover</b><small>Kinetic evidence</small></div>
    <div className={`${styles.miniSystem} ${styles.crateMini}`}><span>▣</span><b>Raised crate</b><small>Object + Earth</small></div>
    <div className={`${styles.miniSystem} ${styles.springMini}`}><span>⌁</span><b>Rescue line</b><small>Stretched</small></div>
    <div className={`${styles.miniSystem} ${styles.podMini}`}><span>∿</span><b>Warm pod</b><small>Particles moving</small></div>
    <div className={`${styles.miniSystem} ${styles.cellMini}`}><span>⬡</span><b>Battery bank</b><small>Particle arrangement</small></div>
  </div>;
  return <div className={styles.sceneWorld}>
    {lens.system && <div className={styles.systemBoundary}><span>chosen system</span></div>}
    <div className={styles.floor} />
    {mission === "kinetic" && <><div className={styles.speedTrail}>{[1,2,3,4].map((item) => <i key={item} />)}</div><div className={styles.rover} style={{ "--mass": mass, "--speed": speed } as React.CSSProperties}><div className={styles.roverCab}><span>ST-08</span></div><div className={styles.roverBody}>{lens.motion && <i>→</i>}<b>{mass} t</b></div><div className={styles.wheelA} /><div className={styles.wheelB} /></div></>}
    {mission === "gravitational" && <><div className={styles.tower}>{[1,2,3,4].map((item) => <i key={item} />)}</div><div className={styles.liftCable} style={{ height: `${32 + (10-height)*2.7}%` }} /><div className={styles.crate} style={{ bottom: `${14 + height*5.5}%` }}><span>MED</span><b>{mass} t</b></div><div className={styles.referenceLine}><span>zero-height reference</span></div></>}
    {mission === "elastic" && <><div className={styles.launchBase} /><div className={styles.spring} style={{ width: `${22 + stretch*5}%` }}>{Array.from({ length: 12 }).map((_, item) => <i key={item} />)}</div><div className={styles.launchCart} style={{ left: `${34 + stretch*4.3}%` }}><span>RESCUE</span><i /></div><div className={styles.anchor}>∥</div></>}
    {mission === "thermal" && <><div className={styles.pod} style={{ "--heat": `${temperature}%`, "--fill": `${36 + mass*5}%` } as React.CSSProperties}><div className={styles.podGlass}><span>{material}</span>{lens.particle && Array.from({ length: 18 }).map((_, item) => <i key={item} style={{ "--i": item } as React.CSSProperties} />)}</div><div className={styles.podBase}>VACCINE POD</div></div><div className={styles.tempReadout}><span>Temperature</span><b>{temperature}°C</b><small>not the whole store</small></div></>}
    {mission === "chemical" && <><div className={styles.batteryRack}>{Array.from({ length: 5 }).map((_, item) => <div key={item} className={item < Math.ceil(amount/2) ? styles.charged : ""}><i /><span>+</span></div>)}</div><div className={styles.chemicalModel}><span>{reserve}</span><strong>{amount} units</strong>{lens.particle && <div>{Array.from({ length: 10 }).map((_, item) => <i key={item} />)}</div>}</div></>}
    {lens.motion && mission !== "kinetic" && <div className={styles.motionLabel}>change in the system ↗</div>}
    <div className={styles.glow} style={{ opacity: .18 + relative * .45 }} />
  </div>;
}

type ControlProps = {
  active: EnergyStoreMissionId; mass: number; setMass: (v: number) => void; speed: number; setSpeed: (v: number) => void; height: number; setHeight: (v: number) => void; stiffness: number; setStiffness: (v: number) => void; stretch: number; setStretch: (v: number) => void; thermalMass: number; setThermalMass: (v: number) => void; temperature: number; setTemperature: (v: number) => void; material: "water" | "oil" | "metal"; setMaterial: (v: "water" | "oil" | "metal") => void; amount: number; setAmount: (v: number) => void; reserve: "battery" | "fuel" | "food"; setReserve: (v: "battery" | "fuel" | "food") => void; vaultSelected: string[]; setVaultSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

function MissionControls(props: ControlProps) {
  const slider = (label: string, value: number, min: number, max: number, suffix: string, change: (v: number) => void) => <label className={styles.range}><span><b>{label}</b><output>{value}{suffix}</output></span><input type="range" min={min} max={max} value={value} onChange={(event) => change(Number(event.target.value))} /></label>;
  if (props.active === "kinetic") return <div className={styles.controlGrid}>{slider("Rover mass", props.mass, 2, 8, " t", props.setMass)}{slider("Rover speed", props.speed, 1, 7, " m/s", props.setSpeed)}</div>;
  if (props.active === "gravitational") return <div className={styles.controlGrid}>{slider("Crate mass", props.mass, 2, 12, " t", props.setMass)}{slider("Deck height", props.height, 1, 10, " m", props.setHeight)}</div>;
  if (props.active === "elastic") return <div className={styles.controlGrid}>{slider("Spring stiffness", props.stiffness, 1, 10, "", props.setStiffness)}{slider("Line stretch", props.stretch, 1, 8, " m", props.setStretch)}</div>;
  if (props.active === "thermal") return <div className={styles.controlGrid}><div className={styles.field}><span>Material</span><div className={styles.segmented}>{(["water","oil","metal"] as const).map((item) => <button key={item} className={props.material === item ? styles.selected : ""} onClick={() => props.setMaterial(item)}>{item}</button>)}</div></div>{slider("Amount of material", props.thermalMass, 1, 8, " kg", props.setThermalMass)}{slider("Temperature", props.temperature, 5, 80, "°C", props.setTemperature)}</div>;
  if (props.active === "chemical") return <div className={styles.controlGrid}><div className={styles.field}><span>Reserve type</span><div className={styles.segmented}>{(["battery","fuel","food"] as const).map((item) => <button key={item} className={props.reserve === item ? styles.selected : ""} onClick={() => props.setReserve(item)}>{item}</button>)}</div></div>{slider("Stored amount", props.amount, 1, 10, " units", props.setAmount)}</div>;
  return <div className={styles.vaultChoices}>{storeChoices.map((choice) => { const selected = props.vaultSelected.includes(choice.id); return <button key={choice.id} className={`${selected ? styles.selectedStore : ""} ${choice.id === "heating" || choice.id === "radiation" ? styles.transferChoice : ""}`} onClick={() => props.setVaultSelected((items) => selected ? items.filter((item) => item !== choice.id) : [...items, choice.id])} aria-pressed={selected}><span>{selected ? "✓" : "+"}</span><b>{choice.label}</b><small>{choice.clue}</small></button>; })}</div>;
}
