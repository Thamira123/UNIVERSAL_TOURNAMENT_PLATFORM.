"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { sports as sportCatalog } from "@/lib/sports";
import { getAccessToken } from "@/lib/api";

const banners = [
  { key: "stadium", label: "Tournament night", image: "/images/utms-hero.webp" },
  { key: "cricket", label: "Cricket competition", image: "/images/cricket-card.webp" },
  { key: "high-jump", label: "High Jump event", image: "/images/high-jump-card.webp" },
];

const sports = sportCatalog.map((sport, index) => ({ href: sport.route, key: String(index + 1).padStart(2, "0"), name: sport.name, category: sport.type, kind: sport.category, detail: sport.description, image: sport.image }));

const currentSteps = [
  { index: "01", title: "Organization", detail: "Create your organization and manage its admins.", tag: "AVAILABLE NOW" },
  { index: "02", title: "Tournament", detail: "Create tournaments and assign tournament admins.", tag: "AVAILABLE NOW" },
  { index: "03", title: "Events", detail: "Add Cricket or High Jump events and categories.", tag: "AVAILABLE NOW" },
  { index: "04", title: "Stages", detail: "Configure stage order, groups, capacity and rounds.", tag: "AVAILABLE NOW" },
];

const nextModules = [
  { index: "01", title: "Teams", detail: "Team and participant registration" },
  { index: "02", title: "Matches", detail: "Fixtures, schedules and results" },
  { index: "03", title: "Rankings", detail: "Standings and points tables" },
  { index: "04", title: "Bracket", detail: "Progression through knockout rounds" },
  { index: "05", title: "Performance history", detail: "Past results and team trends" },
];

const sportsNews = [
  { number: "01", sport: "CRICKET · ASIAN GAMES", date: "03 OCT 2026", title: "India take men’s cricket gold", detail: "India beat Pakistan in the final to claim the men’s cricket gold medal at the 2026 Asian Games.", source: "ICC", href: "https://www.icc-cricket.com/news/india-defeat-pakistan-to-clinch-asian-games-gold", mark: "GOLD" },
  { number: "02", sport: "CRICKET · WORLD CUP 2027", date: "01 OCT 2026", title: "World Cup schedule revealed", detail: "The 2027 tournament will bring 14 teams and 57 matches to South Africa, Zimbabwe and Namibia.", source: "ICC", href: "https://www.icc-cricket.com/news/fixture-schedule-announced-for-icc-men-s-cricket-world-cup-2027", mark: "’27" },
  { number: "03", sport: "CRICKET · TEST SERIES", date: "13 OCT 2026", title: "Australia win in Durban", detail: "Josh Hazlewood led Australia to a 214-run victory over South Africa in the first Test.", source: "Al Jazeera", href: "https://www.aljazeera.com/sports/2026/10/13/australia-bowl-out-south-africa-to-win-first-test-in-durban", mark: "214" },
  { number: "04", sport: "RUGBY LEAGUE · WORLD CUP", date: "15 OCT 2026", title: "A thrilling World Cup opener", detail: "Jack Bostock’s debut hat-trick helped Australia edge New Zealand 24–22 in front of a record crowd.", source: "NRL", href: "https://www.nrl.com/news/2026/10/15/jumping-jacks-flash-bostock-bags-three-on-debut-as-roos-salute/", mark: "24–22" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeSportCategory, setActiveSportCategory] = useState<"all" | "team" | "individual">("all");
  const visibleSports = activeSportCategory === "all" ? sports : sports.filter((sport) => sport.category === activeSportCategory);

  useEffect(() => {
    const syncAuthentication = () => setIsSignedIn(Boolean(getAccessToken()));
    syncAuthentication();
    window.addEventListener("storage", syncAuthentication);
    window.addEventListener("utms:auth-change", syncAuthentication);
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 10000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", syncAuthentication);
      window.removeEventListener("utms:auth-change", syncAuthentication);
    };
  }, []);

  return (
    <main className="utms-home">
      <div className="announcement"><span className="announcement-dot" /> UNIVERSAL TOURNAMENT MANAGEMENT PLATFORM <a href="#workflow">Explore the platform <span aria-hidden="true">↗</span></a></div>
      <header className="site-header">
        <Link className="brand utms-brand" href="/" aria-label="UTMS home"><span className="brand-mark">U</span><span>UTMS<span className="brand-period">.</span></span></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/sports">Sports</Link><a href="#sports-news">News</a><a href="#workflow">How it works</a><a href="#roadmap">2026 roadmap</a>
        </nav>
        <div className="header-actions">{isSignedIn ? <Link className="utms-header-cta" href="/profile">My workspace <span aria-hidden="true">↗</span></Link> : <><Link className="sign-in" href="/login">Sign in</Link><Link className="utms-header-cta" href="/signup">Get started <span aria-hidden="true">↗</span></Link></>}<button className="menu-button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} type="button">{menuOpen ? "×" : "☰"}</button></div>
      </header>
      {menuOpen && <nav className="mobile-menu" aria-label="Mobile navigation"><Link onClick={() => setMenuOpen(false)} href="/sports">Sports</Link><a onClick={() => setMenuOpen(false)} href="#sports-news">News</a><a onClick={() => setMenuOpen(false)} href="#workflow">How it works</a><a onClick={() => setMenuOpen(false)} href="#roadmap">2026 roadmap</a>{isSignedIn ? <Link onClick={() => setMenuOpen(false)} href="/profile">My workspace</Link> : <><Link onClick={() => setMenuOpen(false)} href="/login">Sign in</Link><Link onClick={() => setMenuOpen(false)} href="/signup">Get started</Link></>}</nav>}

      <section className="hero utms-hero" id="top" aria-label="Universal Tournament sports platform">
        <div className="hero-image" aria-hidden="true">{banners.map((banner, index) => <Image className={`hero-banner-image hero-banner-image-${banner.key}${index === activeBanner ? " hero-banner-image-active" : ""}`} src={banner.image} alt="" fill sizes="100vw" priority={index === 0} key={banner.key} />)}</div>
        <div className="hero-content">
          <div className="hero-kicker"><span className="live-pulse" /> UNIVERSAL TOURNAMENT · 2026 <span className="kicker-line" /></div>
          <h1>YOUR SPORT.<br /><em>YOUR STAGE.</em></h1>
          <p>Bring your tournaments, events and competition stages together in one place. Start with Cricket or High Jump and make every game count.</p>
          <div className="hero-links"><Link className="button-light" href={isSignedIn ? "/profile" : "/signup"}>{isSignedIn ? "Open workspace" : "Start organizing"} <span className="arrow">→</span></Link><a className="text-link" href="#sports">Explore sports <span className="arrow">↘</span></a></div>
          <div className="utms-hero-proof"><span>01 <b>ORGANIZATION</b></span><i /><span>02 <b>TOURNAMENT</b></span><i /><span>03 <b>EVENTS & STAGES</b></span></div>
        </div>
        <div className="utms-banner-controls" role="group" aria-label="Featured banner controls"><button type="button" onClick={() => setActiveBanner((activeBanner + banners.length - 1) % banners.length)} aria-label="Previous banner">←</button><span aria-live="polite">0{activeBanner + 1} <i>/</i> 0{banners.length}</span>{banners.map((banner, index) => <button className={`utms-banner-dot${index === activeBanner ? " utms-banner-dot-active" : ""}`} type="button" key={banner.key} onClick={() => setActiveBanner(index)} aria-label={`Show ${banner.label} banner`} aria-pressed={index === activeBanner} />)}<button type="button" onClick={() => setActiveBanner((activeBanner + 1) % banners.length)} aria-label="Next banner">→</button></div>
        <div className="hero-caption"><span>UTMS / 2026</span><i /> ORGANIZE · COMPETE · GROW</div>
      </section>

      <section className="stat-strip utms-stats" aria-label="Platform overview"><div><strong>02</strong><span>SUPPORTED SPORTS</span></div><div><strong>04</strong><span>CORE WORKSPACE STEPS</span></div><div><strong>01</strong><span>ACCOUNT FOR YOUR WORK</span></div><div className="stat-note">BUILT AROUND<br />YOUR TOURNAMENT <span>↘</span></div></section>

      <section className="section utms-news-section" id="sports-news">
        <div className="section-heading utms-news-heading"><div><p className="eyebrow">SPORTS DESK · OCTOBER 2026</p><h2>Good things <em>happening.</em></h2><p>Recent moments and milestones from the world of sport.</p></div><span className="utms-news-count">04 <small>STORIES</small></span></div>
        <div className="utms-news-grid">{sportsNews.map((item) => <a className="utms-news-card" href={item.href} key={item.number} target="_blank" rel="noreferrer"><div className="utms-news-card-top"><span>{item.sport}</span><i>{item.number}</i></div><div className="utms-news-art" aria-hidden="true"><span>{item.mark}</span><b>UTMS / SPORT</b></div><div className="utms-news-copy"><time>{item.date}</time><h3>{item.title}</h3><p>{item.detail}</p><span className="utms-news-source">Read at {item.source} <b>↗</b></span></div></a>)}</div>
      </section>

      <section className="section sports-section utms-sports" id="sports">
        <div className="section-heading"><div><p className="eyebrow">SPORTS DIRECTORY · 2026</p><h2>Find your <em>field.</em></h2><p className="utms-sports-intro">Browse the supported sports by competition category. Each sport opens its own events, formats and tournament details.</p></div><span className="utms-sport-count">02 <small>SPORTS AVAILABLE</small></span></div>
        <div className="utms-category-bar" aria-label="Filter sports by category"><span>SPORT CATEGORIES</span><div><button type="button" aria-pressed={activeSportCategory === "all"} className={activeSportCategory === "all" ? "utms-category-active" : ""} onClick={() => setActiveSportCategory("all")}>All sports <b>02</b></button><button type="button" aria-pressed={activeSportCategory === "team"} className={activeSportCategory === "team" ? "utms-category-active" : ""} onClick={() => setActiveSportCategory("team")}>Team sports <b>01</b></button><button type="button" aria-pressed={activeSportCategory === "individual"} className={activeSportCategory === "individual" ? "utms-category-active" : ""} onClick={() => setActiveSportCategory("individual")}>Individual events <b>01</b></button></div></div>
        <div className="sports-grid">{visibleSports.map((sport) => <Link className={`sport-card utms-sport-card utms-card-${sport.category}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(9,26,32,.03) 12%, rgba(9,26,32,.88) 100%), url(${sport.image})` }} key={sport.key} href={sport.href}><span className="sport-icon">{sport.key}</span><span className="sport-card-bottom"><span><strong>{sport.name}</strong><small>{sport.kind}</small><small className="utms-sport-detail">{sport.detail}</small></span><span className="circle-arrow">↗</span></span></Link>)}</div>
        <div className="sports-foot"><span>New sports can be added as the platform grows.</span><Link href="/signup">Start organizing <span>↗</span></Link></div>
      </section>

      <section className="utms-workflow-section" id="workflow">
        <div className="section utms-workflow">
          <div className="section-heading"><div><p className="eyebrow">AVAILABLE IN YOUR WORKSPACE</p><h2>From setup to <em>stages.</em></h2></div><p className="utms-section-intro">Sign up once. Your profile brings together organizations you own or administer, their tournaments, and the people managing each competition.</p></div>
          <div className="utms-current-flow">{currentSteps.map((step, index) => <article className="utms-flow-card" key={step.index}><div className="utms-flow-card-top"><span>{step.index}</span>{index < currentSteps.length - 1 && <i aria-hidden="true">→</i>}</div><strong>{step.title}</strong><p>{step.detail}</p><small><i /> {step.tag}</small></article>)}</div>
          <div className="utms-workspace-note"><span>YOUR PROFILE</span><p>One email, one profile. See your organizations, organization admins, tournaments and tournament admins together.</p><Link href="/signup">Create your profile <span>→</span></Link></div>
        </div>
      </section>

      <section className="section utms-roadmap-section" id="roadmap">
        <div className="section-heading"><div><p className="eyebrow">UNIVERSAL TOURNAMENT · 2026</p><h2>The competition <em>journey.</em></h2></div><span className="utms-roadmap-label">NEXT PLATFORM MODULES</span></div>
        <p className="utms-roadmap-intro">Your diagram maps the next steps after event setup. These modules are planned for the platform; match and ranking data will appear here once those backend features are built.</p>
        <div className="utms-roadmap">{nextModules.map((item) => <article className="utms-roadmap-card" key={item.index}><span>{item.index}</span><strong>{item.title}</strong><small>{item.detail}</small><em>PLANNED</em></article>)}</div>
        <div className="utms-roadmap-connector" aria-hidden="true"><span>TEAMS</span><i>→</i><span>MATCHES</span><i>→</i><span>RANKING</span><i>→</i><span>BRACKET</span><i>→</i><span>PERFORMANCE HISTORY</span></div>
      </section>

      <section className="community-section utms-final-cta" id="create"><div className="community-orbit" /><div><p className="eyebrow">YOUR TOURNAMENT STARTS HERE</p><h2>Bring every<br /><em>event together.</em></h2><p>Create your account, set up an organization, and build your first tournament workspace.</p><Link className="button-light" href="/signup">Get started <span className="arrow">→</span></Link></div><div className="community-side"><span>UNIVERSAL TOURNAMENT<br />MANAGEMENT PLATFORM</span><strong>UTMS<span>.</span></strong><span>ORGANIZE · COMPETE · GROW</span></div></section>

      <footer className="site-footer utms-footer"><div className="footer-main"><Link className="brand utms-brand" href="/"><span className="brand-mark">U</span><span>UTMS<span className="brand-period">.</span></span></Link><p>One platform to manage every tournament.</p><div className="footer-links"><a href="#sports">Sports</a><a href="#workflow">How it works</a><a href="#roadmap">2026 roadmap</a><Link href="/login">Sign in</Link></div><a className="back-top" href="#top">BACK TO TOP ↗</a></div><div className="footer-bottom"><span>© 2026 UTMS</span><span>CRICKET · HIGH JUMP · MORE TO COME</span><span>TOURNAMENTS, ORGANIZED</span></div></footer>
    </main>
  );
}
