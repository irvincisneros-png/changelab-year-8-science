import Link from "next/link";
import styles from "../change-lab.module.css";

type Outcome = { code: string; title: string; description: string; status?: "live" | "next"; href?: string };
type Strand = { id: string; title: string; description: string; accent: string; outcomes: Outcome[] };

const strands: Strand[] = [
  {
    id: "energy", title: "Energy and systems", accent: "var(--hot)",
    description: "Follow energy through transfers, stores, transformations and chosen system boundaries.",
    outcomes: [
      { code: "7.1.1", title: "Heat transfer", description: "Investigate conduction, convection and radiation across four interactive missions.", status: "live", href: "/play/7-1-1" },
      { code: "7.1.2", title: "Energy stores", description: "Compare kinetic, gravitational, elastic, chemical and thermal stores across six evidence-led missions.", status: "live", href: "/play/7-1-2" },
      { code: "7.1.3", title: "Energy transformations", description: "Build transformation chains from initial stores to useful and dissipated outcomes." },
      { code: "7.1.4", title: "Energy investigation", description: "Design an investigation and represent evidence with energy bars and flows." },
      { code: "7.1.5", title: "System boundaries", description: "Decide what enters, leaves or remains inside open and closed system models." },
      { code: "7.1.6", title: "Conservation and dissipation", description: "Balance an energy ledger and account for transfers to the surroundings." },
      { code: "7.1.7", title: "Solar pathways", description: "Trace energy from the Sun through food, heating, wind, water and technology." },
    ],
  },
  {
    id: "matter", title: "Matter and reactions", accent: "var(--green)",
    description: "Use observations and particle ideas to explain physical, chemical and cellular change.",
    outcomes: [
      { code: "7.2.1", title: "Evidence of change", description: "Compare physical and chemical changes without treating one clue as proof." },
      { code: "7.2.2", title: "Reaction records", description: "Record before-and-after evidence and construct carefully curated word equations." },
      { code: "7.2.3", title: "Reaction energy", description: "Interpret temperature–time data for exothermic and endothermic processes." },
      { code: "7.2.4", title: "Cellular processes", description: "Model photosynthesis and respiration while keeping matter and energy distinct." },
    ],
  },
  {
    id: "earth", title: "A changing Earth", accent: "var(--cool)",
    description: "Reconstruct how Earth changes using patterns, materials, fossils and planetary evidence.",
    outcomes: [
      { code: "7.3.1", title: "Plate boundaries", description: "Explore divergent, convergent and transform boundaries in linked views." },
      { code: "7.3.2", title: "Tectonic evidence", description: "Build an evidence board supporting the theory of plate tectonics." },
      { code: "7.3.3", title: "Global hazard patterns", description: "Connect earthquake and volcano distributions to crustal change." },
      { code: "7.3.4", title: "Earth events and Country", description: "Explore carefully sourced accounts of earthquakes and volcanoes." },
      { code: "7.3.5", title: "Mineral and rock tests", description: "Compare properties using safe virtual observations and tests." },
      { code: "7.3.6", title: "Rock cycle", description: "Link geological processes to transformations among rock types." },
      { code: "7.3.7", title: "Fossil formation", description: "Simulate preservation conditions and interpret the evidence fossils retain." },
      { code: "7.3.8", title: "Relative time", description: "Order strata using superposition while recognising model limitations." },
      { code: "7.3.9", title: "Planetary composition", description: "Compare evidence about Earth’s elements with another planet." },
    ],
  },
  {
    id: "design", title: "Chain-reaction design", accent: "var(--purple)",
    description: "Apply the unit’s big ideas in one connected design challenge.",
    outcomes: [
      { code: "7.4.1", title: "Chain-reaction machine", description: "Design a sequence of changes, then audit its energy transfers and evidence." },
    ],
  },
];

function statusLabel(status?: Outcome["status"]) {
  if (status === "live") return "Ready to play";
  if (status === "next") return "Building next";
  return "Planned";
}

export default function PlayPage() {
  return <div className={styles.shell}>
    <header className={styles.header}>
      <nav className={`${styles.nav} ${styles.frame}`} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="ChangeLab home">
          <span className={styles.brandMark} aria-hidden="true">∆</span>
          <span className={styles.brandText}><strong>ChangeLab</strong><small>Year 8 Science</small></span>
        </Link>
        <div className={styles.navLinks}><Link className={styles.navLink} href="/">Learning map</Link><Link className={styles.navPrimary} href="/play/7-1-2">Play 7.1.2</Link></div>
      </nav>
    </header>
    <main>
      <section className={`${styles.catalogueHero} ${styles.frame}`} aria-labelledby="catalogue-title">
        <p className={styles.eyebrow}>Outcome catalogue</p>
        <h1 id="catalogue-title">Choose the change you want to investigate.</h1>
        <p className={styles.lede}>Choose Heat Transfer Lab or Energy Vault. Upcoming cards show where ChangeLab is heading without pretending unfinished simulations are ready.</p>
        <nav className={styles.catalogueNav} aria-label="Outcome strands">
          {strands.map((strand) => <a href={`#${strand.id}`} key={strand.id}>{strand.title}</a>)}
        </nav>
      </section>
      <div className={styles.frame}>
        {strands.map((strand) => <section className={styles.outcomeSection} id={strand.id} key={strand.id} aria-labelledby={`${strand.id}-title`}>
          <div className={styles.outcomeHeading}><h2 id={`${strand.id}-title`}>{strand.title}</h2><p>{strand.description}</p></div>
          <div className={styles.outcomeGrid}>
            {strand.outcomes.map((outcome) => <article className={styles.outcomeCard} key={outcome.code} style={{ "--accent": strand.accent } as React.CSSProperties}>
              <div className={styles.outcomeTop}>
                <span className={styles.outcomeCode}>{outcome.code}</span>
                <span className={`${styles.status} ${outcome.status === "live" ? styles.statusLive : outcome.status === "next" ? styles.statusNext : ""}`}>{statusLabel(outcome.status)}</span>
              </div>
              <h3>{outcome.title}</h3>
              <p>{outcome.description}</p>
              {outcome.href ? <Link className={styles.cardLink} href={outcome.href}>{outcome.status === "live" ? "Open simulation" : "Preview route"}<span aria-hidden="true">→</span></Link> : <span className={styles.cardLink} aria-disabled="true">Coming later</span>}
            </article>)}
          </div>
        </section>)}
      </div>
    </main>
    <footer className={styles.footer}><div className={`${styles.footerRow} ${styles.frame}`}><span><strong>ChangeLab</strong> · NSW Year 8 Science</span><Link href="/">Return to learning map →</Link></div></footer>
  </div>;
}
