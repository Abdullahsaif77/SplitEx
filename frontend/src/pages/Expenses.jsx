import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ExpenseModal from "../Components/ExpenseModel";
import "../styles/Expenses.css";

/* ============================================================
   MOCK — flip to false when backend is ready
   ============================================================ */
const USE_MOCK = true;

const h = (n) => new Date(Date.now() - 1000 * 60 * 60 * n).toISOString();

const MOCK_EXPENSES = [
  { _id: "e1", date: h(2),   amount: 480, currency: "PKR", description: "Dinner at Kabuli",   payer: { name: "You" },        participants: [{ name: "Alex" }, { name: "Sam" }, { name: "Jules" }, { name: "Maya" }], groupId: { name: "Bali Trip" },    direction: "out" },
  { _id: "e2", date: h(5),   amount: 85,  currency: "PKR", description: "Groceries run",      payer: { name: "Jules" },      participants: [{ name: "Alex" }, { name: "Jules" }, { name: "Riley" }],                 groupId: { name: "Apartment 4B" }, direction: "in" },
  { _id: "e3", date: h(26),  amount: 320, currency: "PKR", description: "Rent — November",    payer: { name: "You" },        participants: [{ name: "Alex" }, { name: "Riley" }, { name: "Chloe" }],                 groupId: { name: "Apartment 4B" }, direction: "out" },
  { _id: "e4", date: h(50),  amount: 240, currency: "PKR", description: "Office lunch",       payer: { name: "You" },        participants: [{ name: "Alex" }, { name: "Amy" }, { name: "Ben" }, { name: "Fatima" }], groupId: { name: "Office Lunch" }, direction: "out" },
  { _id: "e5", date: h(74),  amount: 1450, currency: "PKR", description: "Ski rental",        payer: { name: "Ben" },        participants: [{ name: "Alex" }, { name: "Ben" }, { name: "Daniel" }, { name: "Amy" }],  groupId: { name: "Ski Weekend" },  direction: "in" },
  { _id: "e6", date: h(120), amount: 620, currency: "PKR", description: "Hotel deposit",      payer: { name: "You" },        participants: [{ name: "Alex" }, { name: "Sam" }, { name: "Jules" }, { name: "Maya" }], groupId: { name: "Bali Trip" },    direction: "out" },
  { _id: "e7", date: h(180), amount: 380, currency: "PKR", description: "Dinner club — week 2", payer: { name: "Fatima" },   participants: [{ name: "Alex" }, { name: "Fatima" }, { name: "Hassan" }, { name: "Zara" }], groupId: { name: "Dinner Club" }, direction: "in" },
];

/* ---------- helpers ---------- */
const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("") || "·";

const AVATAR_TONES = ["mustard", "tangerine", "forest", "cyan"];
const toneFor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
};

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };

const dayBucket = (dateStr) => {
  const d = startOfDay(new Date(dateStr));
  const today = startOfDay(new Date());
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff <= 7) return "This week";
  if (diff <= 30) return "This month";
  return "Earlier";
};

const prettyDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = startOfDay(new Date());
  if (startOfDay(d).getTime() === today.getTime()) {
    return "Today";
  }
  return d.toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "short" }).toUpperCase();
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | out | in
  const [visible, setVisible] = useState(15);

  const [formData, setformData] = useState({
    groupId: "",
    createdBy: "",
    payer: "",
    amount: 0,
    description: "",
    split: "equal",
    participants: [],
  });

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (USE_MOCK) {
      const t = setTimeout(() => {
        setExpenses(MOCK_EXPENSES);
        setLoading(false);
      }, 550);
      return () => clearTimeout(t);
    }

    const controller = new AbortController();
    const fetchExpense = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          "https://split-ex-backend.vercel.app/Expenses",
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        setExpenses(data?.UserExpense || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Expenses fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
    return () => controller.abort();
  }, []);

  /* ---------- derived ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses
      .filter((e) => {
        if (filter === "all") return true;
        return e.direction === filter;
      })
      .filter((e) => {
        if (!q) return true;
        return (
          (e.description || "").toLowerCase().includes(q) ||
          (e.payer?.name || "").toLowerCase().includes(q) ||
          (e.groupId?.name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, query, filter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const bucket = dayBucket(e.date);
      if (!map.has(bucket)) map.set(bucket, []);
      map.get(bucket).push(e);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // For load more we slice the flattened list first, then regroup
  const flatVisible = filtered.slice(0, visible);
  const groupedVisible = useMemo(() => {
    const map = new Map();
    flatVisible.forEach((e) => {
      const bucket = dayBucket(e.date);
      if (!map.has(bucket)) map.set(bucket, []);
      map.get(bucket).push(e);
    });
    return Array.from(map.entries());
  }, [flatVisible]);

  const totalSpent = expenses
    .filter((e) => e.direction === "out")
    .reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncoming = expenses
    .filter((e) => e.direction === "in")
    .reduce((s, e) => s + (e.amount || 0), 0);

  const thisMonthSpent = expenses
    .filter((e) => e.direction === "out" && dayBucket(e.date) !== "Earlier")
    .reduce((s, e) => s + (e.amount || 0), 0);

  const avgExpense = expenses.length ? Math.round(
    expenses.reduce((s, e) => s + (e.amount || 0), 0) / expenses.length
  ) : 0;

  const hasMore = visible < filtered.length;
  const handleLoadMore = () => setVisible((v) => v + 15);

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "long" })
    .toUpperCase();

  /* ============================================================
     RENDER — row
     ============================================================ */
  const ExpenseRow = ({ e, index }) => {
    const dir = e.direction || "out";
    const tone = dir === "in" ? "pos" : "neg";
    const sign = dir === "in" ? "−" : "+";

    return (
      <motion.div
        className="ex-row"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, delay: Math.min(index * 0.02, 0.3) }}
      >
        <span className={`ex-row-tag is-${tone}`} aria-hidden="true">
          {dir === "in" ? "↘" : "↗"}
        </span>

        <div className="ex-row-main">
          <div className="ex-row-title-row">
            <h4 className="ex-row-title">
              {e.description || "Untitled expense"}
            </h4>
            <span className={`ex-row-amount is-${tone}`}>
              {sign}
              {e.amount?.toLocaleString()} {e.currency || "PKR"}
            </span>
          </div>

          <div className="ex-row-meta">
            <span className="ex-row-meta-item">
              <strong>{e.payer?.name || "Someone"}</strong> paid
            </span>
            <span className="ex-row-meta-sep">·</span>
            <span className="ex-row-meta-item">{e.groupId?.name || "Group"}</span>
            <span className="ex-row-meta-sep">·</span>
            <span className="ex-row-meta-item">
              {e.participants?.length || 0} people
            </span>
          </div>
        </div>

        <div className="ex-row-chips">
          {(e.participants || []).slice(0, 4).map((p, i) => (
            <span key={i} className={`ex-chip is-${toneFor(p.name)}`} title={p.name}>
              {initialsOf(p.name)}
            </span>
          ))}
          {(e.participants?.length || 0) > 4 && (
            <span className="ex-chip is-more">+{e.participants.length - 4}</span>
          )}
        </div>
      </motion.div>
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="ex-root">
      {/* ============ ANIMATED BG ============ */}
      <div className="ex-bg" aria-hidden="true">
        <div className="ex-bg-orbit" />
        <div className="ex-bg-ring ex-bg-ring-1" />
        <div className="ex-bg-ring ex-bg-ring-2" />
        <div className="ex-bg-grain" />
      </div>

      {/* ============ HERO ============ */}
      <motion.header
        className="ex-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ex-hero-tint" aria-hidden="true" />
        <div className="ex-hero-tape" aria-hidden="true">
          LEDGER · {expenses.length} ENTRIES
        </div>

        <div className="ex-hero-inner">
          <div className="ex-hero-eyebrow">
            <span className="ex-dot" />
            {today}
            <span className="ex-hero-pill">LIVE</span>
          </div>

          <div className="ex-hero-row">
            <div>
              <h1 className="ex-hero-title">
                Every <em>expense</em>, in order.
              </h1>
              <p className="ex-hero-sub">
                What you spent, who paid, who owes. Newest first.
              </p>
            </div>

            <button
              type="button"
              className="ex-hero-create"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="ex-hero-create-plus">+</span>
              New expense
            </button>
          </div>
        </div>
      </motion.header>

      {/* ============ STATS STRIP ============ */}
      <motion.section
        className="ex-stats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        {[
          { k: "TOTAL SPENT", v: totalSpent.toLocaleString(), tone: "neg" },
          { k: "THIS MONTH",  v: thisMonthSpent.toLocaleString(), tone: "mustard" },
          { k: "INCOMING",    v: totalIncoming.toLocaleString(), tone: "pos" },
          { k: "AVG. SIZE",   v: avgExpense.toLocaleString(), tone: "mute" },
        ].map((s, i) => (
          <motion.div
            key={s.k}
            className={`ex-stat is-${s.tone}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
          >
            <span className="ex-stat-label">{s.k}</span>
            <span className="ex-stat-value">
              {loading ? "—" : `PKR ${s.v}`}
            </span>
            <span className="ex-stat-corner" aria-hidden="true" />
          </motion.div>
        ))}
      </motion.section>

      {/* ============ TOOLBAR ============ */}
      <motion.section
        className="ex-toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="ex-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search description, payer, group…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="ex-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="ex-filters">
          {[
            { k: "all", label: "All" },
            { k: "out", label: "Paid" },
            { k: "in",  label: "Owed" },
          ].map((f) => (
            <button
              key={f.k}
              type="button"
              className={`ex-filter ${filter === f.k ? "is-on" : ""}`}
              onClick={() => setFilter(f.k)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ex-count">
          <strong>{filtered.length}</strong>
          <span>shown</span>
        </div>
      </motion.section>

      {/* ============ LEDGER ============ */}
      <motion.section
        className="ex-ledger"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="ex-ledger-head">
          <span className="ex-card-label">The ledger</span>
          <span className="ex-card-meta">
            {grouped.length} {grouped.length === 1 ? "bucket" : "buckets"}
          </span>
        </div>

        {loading ? (
          <div className="ex-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="ex-skel-row">
                <span className="ex-skel ex-skel-tag" />
                <span className="ex-skel ex-skel-body" />
                <span className="ex-skel ex-skel-amount" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ex-empty">
            <div className="ex-empty-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C13.3 2 14.6 2.3 15.8 2.8C17 3.3 18.1 4 19.1 4.9C20 5.9 20.7 7 21.2 8.2C21.7 9.4 22 10.7 22 12C22 13.3 21.7 14.6 21.2 15.8C20.7 17 20 18.1 19.1 19.1C18.1 20 17 20.7 15.8 21.2C14.6 21.7 13.3 22 12 22C10.7 22 9.4 21.7 8.2 21.2C7 20.7 5.9 20 4.9 19.1C4 18.1 3.3 17 2.8 15.8C2.3 14.6 2 13.3 2 12C2 10.7 2.3 9.4 2.8 8.2C3.3 7 4 5.9 4.9 4.9C5.9 4 7 3.3 8.2 2.8C9.4 2.3 10.7 2 12 2Z"
                  stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="ex-empty-title">
              {query ? "No matches found." : "No expenses yet."}
            </h3>
            <p className="ex-empty-sub">
              {query
                ? "Try a different description or payer."
                : "Log your first expense to start tracking."}
            </p>
            {query ? (
              <button
                type="button"
                className="ex-empty-btn"
                onClick={() => { setQuery(""); setFilter("all"); }}
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                className="ex-empty-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Create your first expense
              </button>
            )}
          </div>
        ) : (
          <div className="ex-sections">
            <AnimatePresence initial={false}>
              {groupedVisible.map(([bucket, items]) => (
                <motion.div
                  key={bucket}
                  className="ex-section"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="ex-section-head">
                    <span className="ex-section-title">{bucket}</span>
                    <span className="ex-section-rule" />
                    <span className="ex-section-meta">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="ex-rows">
                    {items.map((e, i) => (
                      <ExpenseRow key={e._id || i} e={e} index={i} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <div className="ex-load-more">
                <button
                  type="button"
                  className="ex-load-btn"
                  onClick={handleLoadMore}
                >
                  <span>Load more</span>
                  <span className="ex-load-count">
                    ({Math.min(15, filtered.length - visible)} remaining)
                  </span>
                  <span className="ex-load-arrow">↓</span>
                </button>
              </div>
            )}

            {!hasMore && filtered.length > 15 && (
              <div className="ex-all-loaded">
                <span className="ex-all-line" />
                <span className="ex-all-text">End of ledger</span>
                <span className="ex-all-line" />
              </div>
            )}
          </div>
        )}
      </motion.section>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setformData={setformData}
        expenseInfo={expenses}
      />
    </div>
  );
};

export default Expenses;