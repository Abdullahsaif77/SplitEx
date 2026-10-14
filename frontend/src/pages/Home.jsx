import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ActivityFeed from "../Components/ActivityFeed";
import tick from "../assets/tick.png";
import "../styles/home.css";

/* ============================================================
   MOCK — flip to false when backend is ready
   ============================================================ */
const USE_MOCK = true;

const MOCK = {
  netBalance: 760,
  totalGet: 1240,
  totalOwe: 480,
  activities: [
    { _id: "a1", type: "expense", title: "Dinner at Kabuli", subtitle: "You paid · split 4 ways", amount: 480, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { _id: "a2", type: "settlement", title: "Sam settled up", subtitle: "Paid you back for rent", amount: 320, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
    { _id: "a3", type: "expense", title: "Groceries run", subtitle: "Jules paid · you owe your share", amount: -85, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
    { _id: "a4", type: "group", title: "Bali Trip created", subtitle: "4 members joined", amount: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
    { _id: "a5", type: "expense", title: "Weekly groceries", subtitle: "You paid · split with roommates", amount: 240, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
  ],
  groups: [
    { _id: "g1", name: "Bali Trip", yourBalance: 420, members: 4 },
    { _id: "g2", name: "Apartment 4B", yourBalance: -180, members: 3 },
    { _id: "g3", name: "Dinner Club", yourBalance: 260, members: 6 },
    { _id: "g4", name: "Ski Weekend", yourBalance: -95, members: 5 },
    { _id: "g5", name: "Office Lunch", yourBalance: 355, members: 8 },
  ],
  user: { name: "Alex" },
};

/* 7-day sparkline (mocked) */
const SPARK = [120, 240, 180, 320, 280, 420, 380];

/* ---------- Count-up hook ---------- */
const useCountUp = (target, { duration = 900 } = {}) => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
};

const Home = () => {
  const [state, setState] = useState({
    net: 0, get: 0, owe: 0,
    activities: [], groups: [],
    loading: true, error: "",
  });

  useEffect(() => {
    if (USE_MOCK) {
      const t = setTimeout(() => {
        setState({
          net: MOCK.netBalance,
          get: MOCK.totalGet,
          owe: MOCK.totalOwe,
          activities: MOCK.activities,
          groups: MOCK.groups,
          loading: false,
          error: "",
        });
      }, 650);
      return () => clearTimeout(t);
    }

    const controller = new AbortController();
    const fetchHome = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(
          "https://split-ex-backend.vercel.app/home",
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
        );
        const totalBalance = Number(data?.totalBalance ?? 0);
        const totalGet = Number(data?.totalGet ?? (totalBalance > 0 ? totalBalance : 0));
        const totalOwe = Number(data?.totalOwe ?? (totalBalance < 0 ? Math.abs(totalBalance) : Number(data?.you_owe ?? 0)));
        const net = Number(data?.netBalance ?? totalGet - totalOwe);
        setState({
          net, get: totalGet, owe: totalOwe,
          activities: data?.activities || [],
          groups: data?.groups || data?.groupBalances || [],
          loading: false, error: "",
        });
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setState((s) => ({ ...s, loading: false, error: "Couldn't load your dashboard. Try refreshing." }));
      }
    };
    fetchHome();
    return () => controller.abort();
  }, []);

  const { net, get, owe, activities, groups, loading, error } = state;

  const netAnimated = useCountUp(net, { duration: 900 });
  const getAnimated = useCountUp(get, { duration: 900 });
  const oweAnimated = useCountUp(owe, { duration: 900 });

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "long" })
    .toUpperCase();

  const weekNumber = (() => {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  })();

  const netTone = net > 0 ? "is-positive" : net < 0 ? "is-negative" : "is-zero";
  const netLabel = net > 0 ? "You're owed" : net < 0 ? "You owe" : "All square";
  const total = get + owe || 1;
  const getPct = Math.round((get / total) * 100);

  const maxGroupAbs = groups.reduce(
    (m, g) => Math.max(m, Math.abs(Number(g.yourBalance ?? 0))), 0
  ) || 1;

  const topGroups = [...groups]
    .sort((a, b) => Math.abs(b.yourBalance ?? 0) - Math.abs(a.yourBalance ?? 0))
    .slice(0, 4);

  const todayTicker = [
    "TRACKING " + (activities.length || 0) + " ACTIVITIES",
    "PKR " + Math.abs(net).toLocaleString() + " NET",
    groups.length ? groups.length + " GROUPS ACTIVE" : "NO ACTIVE GROUPS",
    getPct + "% IN YOUR FAVOR",
    "SETTLED IN REAL TIME",
  ];

  const handleTileMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="hp-root">
      {/* ============ ANIMATED BG ============ */}
      <div className="hp-bg" aria-hidden="true">
        <div className="hp-bg-orbit" />
        <div className="hp-bg-ring hp-bg-ring-1" />
        <div className="hp-bg-ring hp-bg-ring-2" />
        <div className="hp-bg-grain" />
      </div>

      {/* ============ HERO ============ */}
      <motion.header
        className="hp-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hp-hero-tint" aria-hidden="true" />
        <div className="hp-hero-tape" aria-hidden="true">
          FRONT PAGE · WEEK {weekNumber}
        </div>

        <div className="hp-hero-inner">
          <div className="hp-hero-eyebrow">
            <span className="hp-dot" />
            {today}
            <span className="hp-hero-pill">LIVE</span>
          </div>

          <h1 className="hp-hero-title">
            Dear <em>Abdullah</em>.
          </h1>

          <p className="hp-hero-sub">
            Everything you're owed, everything you owe, and what's happened
            lately — in one glance.
          </p>

          {!loading && !error && (
            <div className="hp-hero-chips">
              <span className="hp-chip hp-chip-pos">+{get.toLocaleString()} incoming</span>
              <span className="hp-chip hp-chip-neg">−{owe.toLocaleString()} outgoing</span>
              {activities.length > 0 && (
                <span className="hp-chip hp-chip-mute">{activities.length} recent</span>
              )}
            </div>
          )}
        </div>
      </motion.header>

      {/* ============ TICKER ============ */}
      {!loading && !error && (
        <div className="hp-ticker" aria-hidden="true">
          <div className="hp-ticker-track">
            {[...todayTicker, ...todayTicker].map((t, i) => (
              <React.Fragment key={i}>
                <span>{t}</span>
                <span className="hp-ticker-dot">●</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {error && <div className="hp-error">{error}</div>}

      {/* ============ STATS STRIP ============ */}
      <motion.section
        className="hp-stats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {[
          {
            k: "ACTIVITIES",
            v: activities.length,
            tone: "mute",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12L15 15M21 12A9 9 0 1 1 3 12A9 9 0 0 1 21 12Z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
          },
          {
            k: "GROUPS",
            v: groups.length,
            tone: "mustard",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9 16.6 16.9 15.8 16.2C15.1 15.4 14.1 15 13 15H5C3.9 15 2.9 15.4 2.2 16.2C1.4 16.9 1 17.9 1 19V21M9 11C11.2 11 13 9.2 13 7C13 4.8 11.2 3 9 3C6.8 3 5 4.8 5 7C5 9.2 6.8 11 9 11Z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
          },
          {
            k: "INCOMING",
            v: `+${get.toLocaleString()}`,
            tone: "pos",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M5 12L12 5L19 12"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
          },
          {
            k: "OUTGOING",
            v: `−${owe.toLocaleString()}`,
            tone: "neg",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12L12 19L19 12"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
          },
        ].map((s, i) => (
          <motion.div
            key={s.k}
            className={`hp-stat is-${s.tone}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hp-stat-icon">{s.icon}</span>
            <span className="hp-stat-body">
              <span className="hp-stat-label">{s.k}</span>
              <span className="hp-stat-value">
                {loading ? <span className="hp-skel" /> : s.v}
              </span>
            </span>
            <span className="hp-stat-corner" aria-hidden="true" />
          </motion.div>
        ))}
      </motion.section>

      {/* ============ MAIN + RAIL ============ */}
      <div className="hp-main-rail">
        {/* -------- MAIN COLUMN -------- */}
        <div className="hp-main">
          {/* NET CARD */}
          <motion.section
            className={`hp-net ${netTone}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hp-net-ticks" aria-hidden="true" />

            <div className="hp-card-head">
              <span className="hp-card-label">Net position</span>
              <span className="hp-card-tag">{netLabel}</span>
            </div>

            <div className="hp-net-hero">
              <div className="hp-net-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20V10M10 20V4M16 20V13M22 20H2"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="hp-net-amount">
                {loading ? (
                  <span className="hp-skel hp-skel-lg" />
                ) : (
                  <>
                    {net < 0 ? "−" : net > 0 ? "+" : ""}PKR{" "}
                    {Math.round(netAnimated).toLocaleString()}
                    <span className="hp-cursor" aria-hidden="true" />
                  </>
                )}
              </div>
            </div>

            <div className="hp-net-split">
              <div className="hp-net-row">
                <span className="hp-net-row-label">
                  <span className="hp-mini-dot hp-mini-dot-get" />
                  GET
                </span>
                <span className="hp-net-row-value">
                  {loading ? <span className="hp-skel" /> : `PKR ${Math.round(getAnimated).toLocaleString()}`}
                </span>
              </div>
              <div className="hp-net-row">
                <span className="hp-net-row-label">
                  <span className="hp-mini-dot hp-mini-dot-owe" />
                  OWE
                </span>
                <span className="hp-net-row-value">
                  {loading ? <span className="hp-skel" /> : `PKR ${Math.round(oweAnimated).toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="hp-bar" aria-hidden="true">
              <motion.div className="hp-bar-get"
                initial={{ width: 0 }} animate={{ width: `${getPct}%` }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} />
              <motion.div className="hp-bar-owe"
                initial={{ width: 0 }} animate={{ width: `${100 - getPct}%` }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} />
            </div>
            <div className="hp-bar-labels">
              <span>{getPct}% IN</span>
              <span>{100 - getPct}% OUT</span>
            </div>

            <div className="hp-net-foot">
              <span className="hp-net-foot-line">
                {getPct}% of activity is money coming to you
              </span>
            </div>

            {/* Mini sparkline */}
            <div className="hp-spark" aria-hidden="true">
              <div className="hp-spark-head">
                <span className="hp-spark-label">LAST 7 DAYS</span>
                <span className="hp-spark-value">+PKR 380</span>
              </div>
              <div className="hp-spark-bars">
                {SPARK.map((v, i) => {
                  const max = Math.max(...SPARK);
                  const h = (v / max) * 100;
                  return (
                    <motion.span
                      key={i}
                      className="hp-spark-bar"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      title={`PKR ${v}`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* ACTIVITY FEED — now full width of main column */}
          <motion.section
            className="hp-activity"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hp-card-head">
              <span className="hp-card-label">Recent activity</span>
              <a href="#" className="hp-card-link">View all →</a>
            </div>

            <div className="hp-activity-body">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="skel" className="hp-activity-skeleton"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="hp-skel-row">
                        <span className="hp-skel hp-skel-avatar" />
                        <div className="hp-skel-lines">
                          <span className="hp-skel hp-skel-md" />
                          <span className="hp-skel hp-skel-sm" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : activities.length === 0 ? (
                  <motion.div key="empty" className="hp-empty"
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="hp-empty-icon"
                      animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}>
                      <img src={tick} alt="" />
                    </motion.div>
                    <h3 className="hp-empty-title">All debts settled up.</h3>
                    <p className="hp-empty-sub">
                      Your groups and 1:1 balances are clean. Add an expense to get started.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="feed"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ActivityFeed activities={activities} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        {/* -------- SIDE RAIL -------- */}
        <aside className="hp-rail">
          {/* Top groups */}
          {!loading && groups.length > 0 && (
            <motion.section
              className="hp-rail-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hp-card-head">
                <span className="hp-card-label">Top groups</span>
                <a href="#" className="hp-card-link">All →</a>
              </div>

              <div className="hp-scan" aria-hidden="true" />

              <div className="hp-rail-groups">
                {topGroups.map((g, i) => {
                  const bal = Number(g.yourBalance ?? 0);
                  const tone = bal > 0 ? "pos" : bal < 0 ? "neg" : "zero";
                  return (
                    <motion.div
                      key={g._id || i}
                      className={`hp-rail-group is-${tone}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                    >
                      <span className={`hp-rail-dot is-${tone}`} />
                      <span className="hp-rail-name">{g.name}</span>
                      <span className={`hp-rail-value is-${tone}`}>
                        {bal === 0 ? "—" : `${bal < 0 ? "−" : "+"}${Math.abs(bal).toLocaleString()}`}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Compact bar chart of groups */}
              <div className="hp-rail-bars" aria-hidden="true">
                {groups.slice(0, 5).map((g, i) => {
                  const bal = Number(g.yourBalance ?? 0);
                  const pct = Math.abs(bal) / maxGroupAbs;
                  const tone = bal > 0 ? "pos" : bal < 0 ? "neg" : "zero";
                  return (
                    <motion.span
                      key={g._id || i}
                      className={`hp-rail-bar is-${tone}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct * 100, 12)}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      title={`${g.name}: ${bal}`}
                    />
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Quick actions (stacked) */}
          <motion.section
            className="hp-rail-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hp-card-head">
              <span className="hp-card-label">Jump back in</span>
            </div>

            <div className="hp-rail-actions">
              {[
                { k: "01", label: "Add expense", tone: "pos" },
                { k: "02", label: "Settle up", tone: "neg" },
                { k: "03", label: "Create group", tone: "mute" },
                { k: "04", label: "Invite friend", tone: "mute" },
              ].map((a, i) => (
                <motion.button
                  key={a.k}
                  type="button"
                  className={`hp-rail-action is-${a.tone}`}
                  onMouseMove={handleTileMove}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                  whileHover={{ x: 3 }}
                >
                  <span className="hp-rail-action-num">{a.k}</span>
                  <span className="hp-rail-action-label">{a.label}</span>
                  <span className="hp-rail-action-arrow">→</span>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Tip card */}
          <motion.section
            className="hp-tip"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hp-tip-tape">TIP</span>
            <p className="hp-tip-text">
              Settling up within 48 hours keeps friendships and finances clean.
            </p>
            <a href="#" className="hp-tip-link">Learn more →</a>
          </motion.section>
        </aside>
      </div>
    </div>
  );
};

export default Home;