import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/landing.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import landingImg from "../assets/landingPic.png";
import { useNavigate } from "react-router-dom";

/* ---------- Scroll reveal hook ---------- */
const useReveal = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

/* ---------- Count-up number ---------- */
const CountUp = ({ value, decimals = 2, prefix = "$" }) => {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();
    let raf;

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(start + (end - start) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <>
      {prefix}
      {display.toFixed(decimals)}
    </>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [peopleCount, setPeopleCount] = useState(4);
  const [totalBill, setTotalBill] = useState(240);

  // Section reveal refs
  const [heroRef, heroVisible] = useReveal();
  const [calcRef, calcVisible] = useReveal();
  const [stepsRef, stepsVisible] = useReveal();
  const [featuresRef, featuresVisible] = useReveal();
  const [faqRef, faqVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };
  const handleRegister = () => navigate("/register");

  const marqueeItems = ["SPLIT", "SETTLE", "REPEAT", "TRACK", "SHARE", "RELAX"];

  return (
    <div className={styles.landingPage}>

      {/* ---------- Navbar ---------- */}
      <nav className={`navbar navbar-expand-lg fixed-top ${styles.glassNavbar}`}>
        <div className="container py-2">
          <a className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 text-dark" href="/">
            <span className={styles.brandBadge}>S</span>
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, letterSpacing: "-0.02em" }}>
              SplitEx
            </span>
          </a>
          <div className="ms-auto d-flex align-items-center gap-2 gap-sm-3">
            <button
              className="btn btn-link text-dark text-decoration-none fw-semibold"
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              className={`btn px-4 rounded-pill fw-semibold ${styles.btnGradient}`}
              onClick={handleRegister}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <header className={styles.heroSection} ref={heroRef}>
        <div className="container">
          <div className="row align-items-center pt-5">
            <div className="col-lg-6 text-center text-lg-start py-4">
              <span className={`${styles.heroBadge} ${heroVisible ? styles.revealIn : styles.revealOut}`}>
                ✦ The Next-Gen Expense Splitter
              </span>

              <h1 className={`${styles.heroTitle} mt-4 mb-4`}>
                <span className={`d-block ${heroVisible ? styles.revealIn : styles.revealOut}`} style={{ transitionDelay: "80ms" }}>
                  Split bills.
                </span>
                <span
                  className={`d-block ${styles.gradientText} ${heroVisible ? styles.revealIn : styles.revealOut}`}
                  style={{ transitionDelay: "180ms" }}
                >
                  Keep the peace.
                </span>
              </h1>

              <p
                className={`lead mb-4 ${heroVisible ? styles.revealIn : styles.revealOut}`}
                style={{
                  color: "#4A4540",
                  maxWidth: "34rem",
                  fontSize: "1.05rem",
                  transitionDelay: "280ms",
                }}
              >
                Effortlessly manage group tab expenses, split apartment rent with roommates,
                and settle up in real-time with automated tracking.
              </p>

              <div
                className={`d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 ${
                  heroVisible ? styles.revealIn : styles.revealOut
                }`}
                style={{ transitionDelay: "380ms" }}
              >
                <button
                  className={`btn btn-lg px-4 rounded-pill fw-semibold ${styles.btnGradient} ${styles.btnArrow}`}
                  onClick={handleRegister}
                >
                  Create Free Group
                  <span className={styles.arrow}>→</span>
                </button>
                <button
                  className={`btn btn-outline-dark btn-lg px-4 rounded-pill fw-semibold ${styles.btnHollow}`}
                  onClick={handleLogin}
                >
                  Sign In
                </button>
              </div>

              {/* Stats Bar */}
              <div
                className={`row mt-5 pt-4 text-center text-lg-start ${heroVisible ? styles.revealIn : styles.revealOut}`}
                style={{
                  borderTop: "1.5px solid #1A1A1A",
                  transitionDelay: "480ms",
                }}
              >
                <div className="col-4">
                  <h3 className="fw-bold mb-0" style={{ fontFamily: "Fraunces, serif", fontSize: "2rem", lineHeight: 1 }}>
                    <CountUp value={100} decimals={0} prefix="" />%
                  </h3>
                  <p className="text-uppercase small mb-0 mt-1" style={monoLabel}>Transparent</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold mb-0" style={{ fontFamily: "Fraunces, serif", fontSize: "2rem", lineHeight: 1 }}>
                    $<CountUp value={0} decimals={0} prefix="" />
                  </h3>
                  <p className="text-uppercase small mb-0 mt-1" style={monoLabel}>Hidden Fees</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold mb-0" style={{ fontFamily: "Fraunces, serif", fontSize: "2rem", lineHeight: 1 }}>
                    Live
                  </h3>
                  <p className="text-uppercase small mb-0 mt-1" style={monoLabel}>
                    <span className={styles.pulseDot} /> Instant Sync
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <div className={`${styles.imageWrapper} ${heroVisible ? styles.revealIn : styles.revealOut}`} style={{ transitionDelay: "300ms" }}>
                <div className={styles.floatingBadge}>
                  💸 Paid $45.00 for Dinner
                </div>
                <img
                  src={landingImg}
                  className="img-fluid rounded-4"
                  alt="SplitEx preview"
                  style={{ border: "1.5px solid #1A1A1A", boxShadow: "8px 8px 0 #1A1A1A" }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Marquee ---------- */}
      <div className={styles.marqueeStrip}>
        <div className={styles.marqueeTrack}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <React.Fragment key={i}>
              <span>{item}</span>
              <span className={styles.dot}>●</span>
            </React.Fragment>
          ))}
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <React.Fragment key={`dup-${i}`}>
              <span>{item}</span>
              <span className={styles.dot}>●</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ---------- Calculator ---------- */}
      <section className={`py-5 ${styles.calcSection}`} ref={calcRef}>
        <div className="container py-4">
          <div
            className={`row align-items-center p-4 p-md-5 ${calcVisible ? styles.revealUpIn : styles.revealUpOut}`}
            style={cardShell}
          >
            <div className="col-lg-6 mb-4 mb-lg-0">
              <span
                className="badge fw-semibold mb-3"
                style={{ ...monoBadge, background: "#FFD23F" }}
              >
                Instant Calculator
              </span>
              <h2 className="mb-2" style={{ fontFamily: "Fraunces, serif", fontWeight: 800, letterSpacing: "-0.02em" }}>
                See how easy splitting gets.
              </h2>
              <p style={{ color: "#4A4540" }}>
                Drag the slider to test split scenarios in real time.
              </p>

              <div className="mt-4">
                <label className="fw-semibold text-dark mb-2 d-flex justify-content-between">
                  <span>Total Bill</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace" }}>${totalBill}</span>
                </label>
                <input
                  type="range"
                  className={`form-range ${styles.slider}`}
                  min="20"
                  max="1000"
                  step="10"
                  value={totalBill}
                  onChange={(e) => setTotalBill(Number(e.target.value))}
                />
              </div>

              <div className="mt-3">
                <label className="fw-semibold text-dark mb-2 d-flex justify-content-between">
                  <span>Group Members</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{peopleCount} people</span>
                </label>
                <input
                  type="range"
                  className={`form-range ${styles.slider}`}
                  min="2"
                  max="20"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="col-lg-5 offset-lg-1">
              <div className={`p-4 text-center ${styles.calcResultCard} ${styles.glowingCard}`}>
                <p
                  className="text-uppercase small fw-bold mb-2"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    letterSpacing: "0.12em",
                    color: "#B8E6D5",
                    fontSize: "0.7rem",
                  }}
                >
                  Each Person Pays
                </p>
                <h1
                  className={`mb-0 ${styles.popNumber}`}
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 800,
                    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <CountUp value={totalBill / peopleCount} />
                </h1>
                <p className="small mt-3 mb-4" style={{ color: "#B8E6D5" }}>
                  Calculated evenly across {peopleCount} members
                </p>
                <button
                  className={`btn w-100 rounded-pill py-2 fw-semibold ${styles.btnGradient} ${styles.btnArrow}`}
                  onClick={handleRegister}
                >
                  Start Splitting This Bill
                  <span className={styles.arrow}>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How It Works ---------- */}
      <section className={`py-5 ${styles.stepsSection}`} ref={stepsRef}>
        <div className="container py-4">
          <div className={`text-center mb-5 ${stepsVisible ? styles.revealIn : styles.revealOut}`}>
            <span className="badge fw-semibold mb-3" style={{ ...monoBadge, background: "#FF5B23" }}>
              Simple Workflow
            </span>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, letterSpacing: "-0.02em" }}>
              How SplitEx Works
            </h2>
            <p style={{ color: "#4A4540" }}>Three simple steps to manage group finances.</p>
          </div>

          <div className="row g-4">
            {[
              { n: "01", t: "Create a Group", d: "Start a dedicated group for your trip, house, or event and invite members easily." },
              { n: "02", t: "Add Expenses", d: "Log expenses on the go. Choose who paid and who shares the cost." },
              { n: "03", t: "Settle Balances", d: "Review clear balances and settle accounts seamlessly with integrated Stripe payments." },
            ].map((step, i) => (
              <div className="col-md-4" key={step.n}>
                <div
                  className={`card h-100 p-4 ${styles.stepCard} ${
                    stepsVisible ? styles.revealUpIn : styles.revealUpOut
                  }`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className={styles.stepNumber}>{step.n}</div>
                  <h4 className="h5 mt-3" style={{ fontFamily: "Fraunces, serif", fontWeight: 700 }}>
                    {step.t}
                  </h4>
                  <p style={{ color: "#4A4540" }} className="mb-0">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className={`py-5 ${styles.featuresSection}`} ref={featuresRef}>
        <div className="container py-4">
          <div className={`text-center mb-5 ${featuresVisible ? styles.revealIn : styles.revealOut}`}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Built for everyone.
            </h2>
            <p style={{ color: "#4A4540" }}>Everything you need for transparent group budgeting.</p>
          </div>

          <div className="row g-4">
            {[
              { icon: "👥", cls: "iconEmerald", t: "Smart Groups", d: "Organize expenses for trips, apartments, or events with custom splitting algorithms." },
              { icon: "⚡", cls: "iconIndigo", t: "Real-Time Syncing", d: "Instant balance updates ensure everyone knows who owes what without awkward math." },
              { icon: "💳", cls: "iconCyan", t: "Stripe Payments", d: "Pay and settle debts securely through Stripe with automatic ledger entries." },
            ].map((f, i) => (
              <div className="col-md-4" key={f.t}>
                <div
                  className={`card h-100 p-4 ${styles.featureCard} ${
                    featuresVisible ? styles.revealUpIn : styles.revealUpOut
                  }`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className={`${styles.iconBox} ${styles[f.cls]} mb-3 ${styles.iconFloat}`}>
                    {f.icon}
                  </div>
                  <h4 className="h5" style={{ fontFamily: "Fraunces, serif", fontWeight: 700 }}>
                    {f.t}
                  </h4>
                  <p style={{ color: "#4A4540" }} className="mb-0">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className={`py-5 ${styles.faqSection}`} ref={faqRef}>
        <div className="container py-4">
          <div className={`text-center mb-5 ${faqVisible ? styles.revealIn : styles.revealOut}`}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Questions, answered.
            </h2>
            <p style={{ color: "#4A4540" }}>Have questions? We've got answers.</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className={`accordion p-3 ${faqVisible ? styles.revealUpIn : styles.revealUpOut}`}
                id="faqAccordion"
                style={cardShell}
              >
                {[
                  { id: "faq1", q: "Is SplitEx free to use?", a: "Yes! You can create groups, log expenses, and track balances completely free of charge." },
                  { id: "faq2", q: "How are payments handled?", a: "Settlements are powered by Stripe, ensuring bank-level security for card transactions and direct payouts." },
                  { id: "faq3", q: "Can I split unequal amounts?", a: "Yes, you can split expenses evenly, by exact percentages, or assign specific dollar amounts per person." },
                ].map((item, i, arr) => (
                  <div
                    key={item.id}
                    className="accordion-item py-2"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #E5DED2" : "none" }}
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed bg-transparent shadow-none"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${item.id}`}
                        style={{ fontFamily: "Fraunces, serif", fontWeight: 600, color: "#1A1A1A" }}
                      >
                        {item.q}
                      </button>
                    </h2>
                    <div id={item.id} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body" style={{ color: "#4A4540" }}>
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className={`py-5 ${styles.ctaSection}`} ref={ctaRef}>
        <div className="container py-4">
          <div className={`text-center ${ctaVisible ? styles.revealUpIn : styles.revealUpOut}`}>
            <h2
              className="mb-3"
              style={{
                fontFamily: "Fraunces, serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Stop chasing friends<br />
              for <span className={styles.gradientText}>ten bucks.</span>
            </h2>
            <p style={{ color: "#4A4540", maxWidth: "32rem", margin: "0 auto 1.75rem" }}>
              Set up your first group in under a minute. Free forever, no card required.
            </p>
            <button
              className={`btn btn-lg px-5 rounded-pill fw-semibold ${styles.btnGradient} ${styles.btnArrow}`}
              onClick={handleRegister}
            >
              Get Started Free
              <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className={`pt-5 pb-4 ${styles.footer}`}>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-4">
              <h5 className="fw-bold d-flex align-items-center gap-2">
                <span className={styles.brandBadge}>S</span>
                <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800 }}>SplitEx</span>
              </h5>
              <p className="small mt-3" style={{ color: "#B8B0A8" }}>
                Smart expense splitter built for modern groups, roommates, and teams.
              </p>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="small text-uppercase fw-bold" style={monoLabel}>Navigation</h6>
              <ul className="list-unstyled mt-3 small">
                <li className="mb-2"><a href="/" className="text-decoration-none">Home</a></li>
                <li className="mb-2"><a href="/login" className="text-decoration-none">Login</a></li>
                <li><a href="/register" className="text-decoration-none">Register</a></li>
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="small text-uppercase fw-bold" style={monoLabel}>Legal</h6>
              <ul className="list-unstyled mt-3 small">
                <li className="mb-2"><a href="#" className="text-decoration-none">Privacy Policy</a></li>
                <li><a href="#" className="text-decoration-none">Terms of Service</a></li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h6 className="small text-uppercase fw-bold" style={monoLabel}>Contact</h6>
              <p className="small mt-3 mb-1" style={{ color: "#B8B0A8" }}>support@splitex.com</p>
              <p className="small" style={{ color: "#B8B0A8" }}>
                © {new Date().getFullYear()} SplitEx. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ---------- Shared inline style objects ---------- */
const monoLabel = {
  fontFamily: "JetBrains Mono, monospace",
  letterSpacing: "0.1em",
  color: "#8A817C",
  fontSize: "0.7rem",
};

const monoBadge = {
  color: "#1A1A1A",
  border: "1.5px solid #1A1A1A",
  borderRadius: "4px",
  fontFamily: "JetBrains Mono, monospace",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontSize: "0.7rem",
  padding: "0.4rem 0.75rem",
};

const cardShell = {
  background: "#FFFFFF",
  borderRadius: "20px",
  border: "1.5px solid #1A1A1A",
  boxShadow: "6px 6px 0 #1A1A1A",
};

export default Landing;