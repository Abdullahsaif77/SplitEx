import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Users.css";

/* ============================================================
   MOCK — flip to false when backend is ready
   ============================================================ */
const USE_MOCK = true;

const MOCK_FRIENDS = [
  { _id: "u1", name: "Alex Rivera",    email: "alex@example.com",    status: "active" },
  { _id: "u2", name: "Amy Sharma",     email: "amy@example.com",     status: "active" },
  { _id: "u3", name: "Ben Rosen",      email: "ben@example.com",     status: "away" },
  { _id: "u4", name: "Bilal Khan",     email: "bilal@example.com",   status: "active" },
  { _id: "u5", name: "Chloe Park",     email: "chloe@example.com",   status: "active" },
  { _id: "u6", name: "Daniel Osei",    email: "daniel@example.com",  status: "away" },
  { _id: "u7", name: "Fatima Zaidi",   email: "fatima@example.com",  status: "active" },
  { _id: "u8", name: "Hassan Ali",     email: "hassan@example.com",  status: "active" },
  { _id: "u9", name: "Jules Okafor",   email: "jules@example.com",   status: "active" },
  { _id: "u10", name: "Maya Singh",    email: "maya@example.com",    status: "active" },
  { _id: "u11", name: "Nora Flores",   email: "nora@example.com",    status: "away" },
  { _id: "u12", name: "Sam Rivera",    email: "sam@example.com",     status: "active" },
  { _id: "u13", name: "Zara Sheikh",   email: "zara@example.com",    status: "active" },
];

/* ---------- helpers ---------- */
const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("") || "·";

const AVATAR_TONES = ["mustard", "tangerine", "forest", "cyan"];

const toneFor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
};

const Users = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | away

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (USE_MOCK) {
      const t = setTimeout(() => {
        setFriends(MOCK_FRIENDS);
        setLoading(false);
      }, 550);
      return () => clearTimeout(t);
    }

    const controller = new AbortController();
    const fetchFriends = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          "https://split-ex-backend.vercel.app/friends",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          }
        );
        setFriends(data?.Friends || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Friends fetch:", err);
        setError("Couldn't load the directory. Try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
    return () => controller.abort();
  }, []);

  /* ---------- derived ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return friends
      .filter((f) => {
        if (filter === "active" && f.status !== "active") return false;
        if (filter === "away" && f.status !== "away") return false;
        return true;
      })
      .filter((f) => {
        if (!q) return true;
        return (
          (f.name || "").toLowerCase().includes(q) ||
          (f.email || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [friends, query, filter]);

  /* group by first letter */
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((f) => {
      const letter = (f.name || "#")[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(f);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totalActive = friends.filter((f) => f.status === "active").length;
  const totalAway = friends.filter((f) => f.status === "away").length;
  const thisWeek = Math.min(friends.length, 3); // fake metric until backend provides

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
    .toUpperCase();

  const handleClear = () => {
    setQuery("");
    setFilter("all");
  };

  return (
    <div className="fr-root">
      {/* ============ ANIMATED BG ============ */}
      <div className="fr-bg" aria-hidden="true">
        <div className="fr-bg-orbit" />
        <div className="fr-bg-ring fr-bg-ring-1" />
        <div className="fr-bg-ring fr-bg-ring-2" />
        <div className="fr-bg-grain" />
      </div>

      {/* ============ HERO ============ */}
      <motion.header
        className="fr-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="fr-hero-tint" aria-hidden="true" />
        <div className="fr-hero-tape" aria-hidden="true">
          DIRECTORY · {friends.length} PEOPLE
        </div>

        <div className="fr-hero-inner">
          <div className="fr-hero-eyebrow">
            <span className="fr-dot" />
            {today}
            <span className="fr-hero-pill">LIVE</span>
          </div>

          <h1 className="fr-hero-title">
            The <em>people</em> you split with.
          </h1>

          <p className="fr-hero-sub">
            Everyone in your network. Find them, message them, split with them.
          </p>
        </div>
      </motion.header>

      {/* ============ STATS STRIP ============ */}
      <motion.section
        className="fr-stats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        {[
          { k: "TOTAL",  v: friends.length, tone: "mute" },
          { k: "ACTIVE", v: totalActive,    tone: "pos" },
          { k: "AWAY",   v: totalAway,      tone: "neg" },
          { k: "NEW THIS WEEK", v: thisWeek, tone: "mustard" },
        ].map((s, i) => (
          <motion.div
            key={s.k}
            className={`fr-stat is-${s.tone}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
          >
            <span className="fr-stat-label">{s.k}</span>
            <span className="fr-stat-value">{loading ? "—" : s.v}</span>
            <span className="fr-stat-corner" aria-hidden="true" />
          </motion.div>
        ))}
      </motion.section>

      {/* ============ SEARCH + FILTER ============ */}
      <motion.section
        className="fr-toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="fr-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="fr-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className="fr-filters">
          {[
            { k: "all", label: "All" },
            { k: "active", label: "Active" },
            { k: "away", label: "Away" },
          ].map((f) => (
            <button
              key={f.k}
              type="button"
              className={`fr-filter ${filter === f.k ? "is-on" : ""}`}
              onClick={() => setFilter(f.k)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="fr-count">
          <strong>{filtered.length}</strong>
          <span>shown</span>
        </div>
      </motion.section>

      {error && <div className="fr-error">{error}</div>}

      {/* ============ DIRECTORY ============ */}
      <motion.section
        className="fr-directory"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="fr-directory-head">
          <span className="fr-card-label">The directory</span>
          <span className="fr-card-meta">
            A–Z · {grouped.length} {grouped.length === 1 ? "section" : "sections"}
          </span>
        </div>

        {loading ? (
          <div className="fr-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="fr-skel-row">
                <span className="fr-skel fr-skel-avatar" />
                <span className="fr-skel fr-skel-name" />
                <span className="fr-skel fr-skel-email" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="fr-empty">
            <div className="fr-empty-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="fr-empty-title">
              {query ? "No matches found." : "Nobody here yet."}
            </h3>
            <p className="fr-empty-sub">
              {query
                ? "Try a different name or email."
                : "Add a friend to start splitting expenses."}
            </p>
            {query && (
              <button type="button" className="fr-empty-btn" onClick={handleClear}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="fr-sections">
            <AnimatePresence initial={false}>
              {grouped.map(([letter, people]) => (
                <motion.div
                  key={letter}
                  className="fr-section"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="fr-letter">
                    <span className="fr-letter-char">{letter}</span>
                    <span className="fr-letter-rule" />
                    <span className="fr-letter-count">
                      {people.length}
                    </span>
                  </div>

                  <ul className="fr-list">
                    {people.map((f, i) => {
                      const tone = toneFor(f.name || "");
                      const isActive = f.status === "active";
                      return (
                        <motion.li
                          key={f._id || i}
                          className="fr-row"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.28, delay: i * 0.03 }}
                        >
                          <span className={`fr-avatar is-${tone}`}>
                            {initialsOf(f.name)}
                          </span>

                          <span className="fr-info">
                            <span className="fr-name">{f.name || "Unknown"}</span>
                            <span className="fr-email">
                              {f.email || "no email"}
                            </span>
                          </span>

                          <span className={`fr-status ${isActive ? "is-on" : "is-off"}`}>
                            <span className="fr-status-dot" />
                            {isActive ? "Active" : "Away"}
                          </span>

                          <button
                            type="button"
                            className="fr-msg"
                            aria-label={`Message ${f.name}`}
                          >
                            Message
                            <span className="fr-msg-arrow">→</span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default Users;