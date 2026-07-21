import Link from "next/link";
import styles from "./change-lab.module.css";

const pathways = [
  {
    range: "7.1.1–7.1.7",
    title: "Energy and systems",
    description: "Track energy as it transfers, changes stores and crosses the boundaries of everyday systems.",
    count: "7 outcomes",
    accent: "var(--hot)",
    anchor: "energy",
  },
  {
    range: "7.2.1–7.2.4",
    title: "Matter and reactions",
    description: "Use evidence to distinguish physical and chemical change, then investigate energy in reactions and cells.",
    count: "4 outcomes",
    accent: "var(--green)",
    anchor: "matter",
  },
  {
    range: "7.3.1–7.3.9",
    title: "A changing Earth",
    description: "Connect plate movement, rocks, fossils and planetary evidence to changes across immense timescales.",
    count: "9 outcomes",
    accent: "var(--cool)",
    anchor: "earth",
  },
  {
    range: "7.4.1",
    title: "Chain-reaction design",
    description: "Build a connected machine and explain how every step transfers energy and changes the system.",
    count: "1 outcome",
    accent: "var(--purple)",
    anchor: "design",
  },
] as const;

function Header() {
  return <header className={styles.header}>
    <nav className={`${styles.nav} ${styles.frame}`} aria-label="Main navigation">
      <Link className={styles.brand} href="/" aria-label="ChangeLab home">
        <span className={styles.brandMark} aria-hidden="true">∆</span>
        <span className={styles.brandText}><strong>ChangeLab</strong><small>Year 8 Science</small></span>
      </Link>
      <div className={styles.navLinks}>
        <Link className={styles.navLink} href="/#learning-map">Learning map</Link>
        <Link className={styles.navPrimary} href="/play">Explore outcomes</Link>
      </div>
    </nav>
  </header>;
}

function Footer() {
  return <footer className={styles.footer}>
    <div className={`${styles.footerRow} ${styles.frame}`}>
      <span><strong>ChangeLab</strong> · NSW Year 8 Science</span>
      <Link href="/play">Browse the outcome catalogue →</Link>
    </div>
  </footer>;
}

export default function Home() {
  return <div className={styles.shell}>
    <Header />
    <main>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={`${styles.heroGrid} ${styles.frame}`}>
          <div>
            <p className={styles.eyebrow}>NSW Year 8 Science · Change</p>
            <h1 id="home-title">Change the system. <span>See why.</span></h1>
            <p className={styles.lede}>Explore how energy moves, matter rearranges and Earth transforms through interactive science models where every choice changes the evidence.</p>
            <div className={styles.buttonRow}>
              <Link className={styles.buttonPrimary} href="/play/7-1-2">Start Energy Stores →</Link>
              <Link className={styles.buttonSecondary} href="/play/7-1-1">Heat Transfer Lab</Link>
              <Link className={styles.buttonSecondary} href="/play">View all outcomes</Link>
            </div>
          </div>
          <aside className={styles.systemCard} aria-label="ChangeLab central idea">
            <p className={styles.systemTitle}>The idea connecting every topic</p>
            <div className={styles.energyFlow}>
              <div className={styles.energyNode}><span aria-hidden="true">●</span><strong>Starting system</strong></div>
              <span className={styles.energyArrow} aria-hidden="true">→</span>
              <div className={styles.energyNode}><span aria-hidden="true">✦</span><strong>Changed system</strong></div>
            </div>
            <p className={styles.systemNote}>Processes transfer energy and rearrange matter. Evidence helps us explain what changed.</p>
          </aside>
        </div>
      </section>

      <section className={styles.sectionAlt} id="learning-map" aria-labelledby="map-title">
        <div className={styles.frame}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Learning map</p><h2 id="map-title">Four pathways through change</h2></div>
            <p>Begin with energy transfer, or choose the pathway your class is studying. New simulations will appear here as ChangeLab grows.</p>
          </div>
          <div className={styles.pathGrid}>
            {pathways.map((pathway) => <article className={styles.pathCard} key={pathway.range} style={{ "--accent": pathway.accent } as React.CSSProperties}>
              <span className={styles.pathNumber}>{pathway.range}</span>
              <h3>{pathway.title}</h3>
              <p>{pathway.description}</p>
              <div className={styles.pathMeta}><span>{pathway.count}</span><Link href={`/play#${pathway.anchor}`}>Explore pathway →</Link></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="featured-title">
        <div className={`${styles.featured} ${styles.frame}`}>
          <div className={styles.featuredCopy}>
            <p className={styles.eyebrow}>Two simulations available · 7.1.1–7.1.2</p>
            <h2 id="featured-title">Energy systems</h2>
            <p>Begin with Heat Transfer Lab, then enter Energy Vault to compare kinetic, gravitational, elastic, thermal and chemical stores using motion, system and particle evidence.</p>
            <div className={styles.methodPills} aria-label="Available energy ideas"><span>Energy transfer</span><span>Kinetic store</span><span>Potential stores</span><span>Thermal store</span></div>
            <div className={styles.buttonRow}>
              <Link className={styles.buttonPrimary} href="/play/7-1-2">Enter Energy Vault →</Link>
              <Link className={styles.buttonSecondary} href="/play/7-1-1">Open Heat Transfer</Link>
            </div>
          </div>
          <div className={styles.featuredVisual} role="img" aria-label="ChangeLab energy systems: a rover, lifted crate, spring, insulated pod and battery" />
        </div>
      </section>
    </main>
    <Footer />
  </div>;
}
