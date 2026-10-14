import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/BalanceCard.css";

/* ============================================================
   MOCK — flip to false when backend is ready
   ============================================================ */
const USE_MOCK = true;

const MOCK_BALANCES = [
  { name: "Sam Rivera",      net: 1240 },
  { name: "Jules Okafor",    net: 320 },
  { name: "Dinner Club",     net: 260 },
  { name: "Riley Chen",      net: -480 },
  { name: "Alex Patel",      net: -85 },
  { name: "Maya Singh",      net: 0 },
  { name: "Kabul House",     net: -240 },
  { name: "Office Lunch",    net: 355 },
  { name: "Ski Trip Fund",   net: -120 },
  { name: "Nora Flores",     net: 0 },
];

/* ---------- helpers ---------- */
const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("") || "·";

const fmt = (n) =>
  `${n < 0 ? "−" : n > 0 ? "+" : ""}PKR ${Math.abs(n).toLocaleString()}`;

/* ---------- count-up ---------- */
const useCountUp = (target, duration = 700) => {
  const [v, setV] = useState(0);
  const fromRef = React.useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
};

const Balances = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);

  useEffect(() => {
    if (USE_MOCK) {
      const t = setTimeout(() => {
        setBalances(MOCK_BALANCES);
        setLoading(false);
      }, 550);
      return () => clearTimeout(t);
    }

    const controller = new AbortController();
    const fetchBalances = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          "https://split-ex-backend.vercel.app/balances",
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        const balance = data?.balance || [];
        const names = data?.names || [];
        const merge = balance.map((bal, i) => ({
          net: Number(bal.net ?? 0),
          name: names[i],
        }));
        setBalances(merge);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Balances fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
    return () => controller.abort();
  }, []);

  /* ---------- derived ---------- */
  const willReceive = balances.filter((b) => b.net > 0);
  const willPay = balances.filter((b) => b.net < 0);
  const settled = balances.filter((b) => b.net === 0);

  const totalReceive = willReceive.reduce((s, b) => s + b.net, 0);
  const totalPay = Math.abs(willPay.reduce((s, b) => s + b.net, 0));
  const netTotal = totalReceive - totalPay;

  const totalForBar = totalReceive + totalPay || 1;
  const receivePct = Math.round((totalReceive / totalForBar) * 100);

  const receiveAnim = useCountUp(totalReceive);
  const payAnim = useCountUp(totalPay);

  /* ---------- grouping for the ledger ---------- */
  const shownReceive = willReceive.slice(0, displayCount);
  const shownPay = willPay.slice(0, Math.max(displayCount - shownReceive.length, 0));
  const shownSettled = settled.slice(
    0,
    Math.max(displayCount - shownReceive.length - shownPay.length, 0)
  );

  const remaining =
    willReceive.length +
    willPay.length +
    settled.length -
    (shownReceive.length + shownPay.length + shownSettled.length);
  const hasMore = remaining > 0;

  const handleLoadMore = () => setDisplayCount((c) => c + 8);

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
    .toUpperCase();

  /* ============================================================
     RENDER ROW
     ============================================================ */
  const BalanceRow = ({ b, tone, actionLabel }) => (
    <motion.div
      className={`bl-row is-${tone}`}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={`bl-row-avatar is-${tone}`} aria-hidden="true">
        {initialsOf(b.name)}
      </span>

      <span className="bl-row-name">{b.name || "Unknown"}</span>

      <span className="bl-row-leader" aria-hidden="true" />

      <span className={`bl-row-value is-${tone}`}>{fmt(b.net)}</span>

      {actionLabel && (
        <button
          type="button"
          className={`bl-row-action is-${tone}`}
          aria-label={`${actionLabel} with ${b.name}`}
        >
          {actionLabel}
          <span className="bl-row-action-arrow">→</span>
        </button>
      )}

      {!actionLabel && (
        <span className={`bl-row-check is-${tone}`} aria-hidden="true">
          ✓
        </span>
      )}
    </motion.div>
  );

  return (
    <div className="bl-root">
      {/* ============ ANIMATED BG ============ */}
      <div className="bl-bg" aria-hidden="true">
        <div className="bl-bg-orbit" />
        <div className="bl-bg-ring bl-bg-ring-1" />
        <div className="bl-bg-ring bl-bg-ring-2" />
        <div className="bl-bg-grain" />
      </div>

      {/* ============ HEADER ============ */}
      <motion.header
        className="bl-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bl-hero-tint" aria-hidden="true" />
        <div className="bl-hero-tape" aria-hidden="true">
          LEDGER · {balances.length} ENTRIES
        </div>

        <div className="bl-hero-inner">
          <div className="bl-hero-eyebrow">
            <span className="bl-dot" />
            {today}
            <span className="bl-hero-pill">LIVE</span>
          </div>

          <h1 className="bl-hero-title">
            Who owes <em>whom</em>.
          </h1>

          <p className="bl-hero-sub">
            Every open balance, grouped by direction. Settle up in one tap.
          </p>
        </div>
      </motion.header>

      {/* ============ SUMMARY STRIP ============ */}
      <motion.section
        className="bl-stats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        {[
          {
            k: "WILL RECEIVE",
            v: willReceive.length,
            sub: `+PKR ${Math.round(receiveAnim).toLocaleString()}`,
            tone: "pos",
          },
          {
            k: "WILL PAY",
            v: willPay.length,
            sub: `−PKR ${Math.round(payAnim).toLocaleString()}`,
            tone: "neg",
          },
          {
            k: "SETTLED",
            v: settled.length,
            sub: "all clear",
            tone: "mute",
          },
        ].map((s, i) => (
          <motion.div
            key={s.k}
            className={`bl-stat is-${s.tone}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
          >
            <span className="bl-stat-body">
              <span className="bl-stat-label">{s.k}</span>
              <span className="bl-stat-count">{loading ? "—" : s.v}</span>
              <span className="bl-stat-sub">{loading ? "" : s.sub}</span>
            </span>
            <span className="bl-stat-corner" aria-hidden="true" />
          </motion.div>
        ))}
      </motion.section>

      {/* ============ SPLIT BAR ============ */}
      {!loading && balances.length > 0 && (
        <motion.section
          className="bl-split"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="bl-split-head">
            <span className="bl-split-title">Direction of money</span>
            <span className="bl-split-net">
              Net:{" "}
              <strong className={netTotal >= 0 ? "is-pos" : "is-neg"}>
                {fmt(netTotal)}
              </strong>
            </span>
          </div>

          <div className="bl-split-bar" aria-hidden="true">
            <motion.div
              className="bl-split-get"
              initial={{ width: 0 }}
              animate={{ width: `${receivePct}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="bl-split-pay"
              initial={{ width: 0 }}
              animate={{ width: `${100 - receivePct}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="bl-split-labels">
            <span>
              <span className="bl-mini-dot is-pos" /> {receivePct}% incoming
            </span>
            <span>
              <span className="bl-mini-dot is-neg" /> {100 - receivePct}% outgoing
            </span>
          </div>
        </motion.section>
      )}

      {/* ============ LEDGER ============ */}
      <motion.section
        className="bl-ledger"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bl-ledger-head">
          <span className="bl-card-label">The ledger</span>
          <span className="bl-card-meta">
            {balances.length} {balances.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {loading ? (
          <div className="bl-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bl-skel-row">
                <span className="bl-skel bl-skel-avatar" />
                <span className="bl-skel bl-skel-name" />
                <span className="bl-skel bl-skel-value" />
              </div>
            ))}
          </div>
        ) : balances.length === 0 ? (
          <div className="bl-empty">
            <div className="bl-empty-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 12L10 15L17 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="bl-empty-title">Everything's settled.</h3>
            <p className="bl-empty-sub">
              No open balances between you and anyone else. Add an expense to
              get things moving.
            </p>
          </div>
        ) : (
          <div className="bl-ledger-body">
            {shownReceive.length > 0 && (
              <div className="bl-section">
                <div className="bl-section-head">
                  <span className="bl-section-dot is-pos" />
                  <span className="bl-section-title">You're owed</span>
                  <span className="bl-section-rule" />
                  <span className="bl-section-total is-pos">
                    +PKR {totalReceive.toLocaleString()}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {shownReceive.map((b, i) => (
                    <BalanceRow
                      key={`r-${b.name}-${i}`}
                      b={b}
                      tone="pos"
                      actionLabel="Settle"
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {shownPay.length > 0 && (
              <div className="bl-section">
                <div className="bl-section-head">
                  <span className="bl-section-dot is-neg" />
                  <span className="bl-section-title">You owe</span>
                  <span className="bl-section-rule" />
                  <span className="bl-section-total is-neg">
                    −PKR {totalPay.toLocaleString()}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {shownPay.map((b, i) => (
                    <BalanceRow
                      key={`p-${b.name}-${i}`}
                      b={b}
                      tone="neg"
                      actionLabel="Pay"
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {shownSettled.length > 0 && (
              <div className="bl-section">
                <div className="bl-section-head">
                  <span className="bl-section-dot is-zero" />
                  <span className="bl-section-title">Settled</span>
                  <span className="bl-section-rule" />
                  <span className="bl-section-total is-zero">
                    {settled.length} clean
                  </span>
                </div>
                {shownSettled.map((b, i) => (
                  <BalanceRow
                    key={`s-${b.name}-${i}`}
                    b={b}
                    tone="zero"
                    actionLabel={null}
                  />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="bl-load-more">
                <button
                  type="button"
                  className="bl-load-btn"
                  onClick={handleLoadMore}
                >
                  <span>Load more</span>
                  <span className="bl-load-count">
                    ({Math.min(8, remaining)} remaining)
                  </span>
                  <span className="bl-load-arrow">↓</span>
                </button>
              </div>
            )}

            {!hasMore && balances.length > 8 && (
              <div className="bl-all-loaded">
                <span className="bl-all-line" />
                <span className="bl-all-text">End of ledger</span>
                <span className="bl-all-line" />
              </div>
            )}
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default Balances;