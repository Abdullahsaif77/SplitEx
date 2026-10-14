import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CreateGroup from "../Components/CreateGroup";
import GroupPage from "../Components/GroupPage";
import "../styles/Group.css";

/* ============================================================
   MOCK — flip to false when backend is ready
   ============================================================ */
const USE_MOCK = true;

const MOCK_GROUPS = [
  {
    _id: "g1",
    name: "Bali Trip 2025",
    members: [
      { userId: { name: "Alex Rivera" } },
      { userId: { name: "Sam Rivera" } },
      { userId: { name: "Jules Okafor" } },
      { userId: { name: "Maya Singh" } },
    ],
    yourBalance: 420,
    totalSpent: 3200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    _id: "g2",
    name: "Apartment 4B",
    members: [
      { userId: { name: "Alex Rivera" } },
      { userId: { name: "Riley Chen" } },
      { userId: { name: "Chloe Park" } },
    ],
    yourBalance: -180,
    totalSpent: 8500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    _id: "g3",
    name: "Dinner Club",
    members: [
      { userId: { name: "Alex Rivera" } },
      { userId: { name: "Fatima Zaidi" } },
      { userId: { name: "Hassan Ali" } },
      { userId: { name: "Zara Sheikh" } },
      { userId: { name: "Bilal Khan" } },
      { userId: { name: "Nora Flores" } },
    ],
    yourBalance: 260,
    totalSpent: 1450,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    _id: "g4",
    name: "Ski Weekend",
    members: [
      { userId: { name: "Alex Rivera" } },
      { userId: { name: "Ben Rosen" } },
      { userId: { name: "Daniel Osei" } },
      { userId: { name: "Amy Sharma" } },
    ],
    yourBalance: -95,
    totalSpent: 2100,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    _id: "g5",
    name: "Office Lunch",
    members: [
      { userId: { name: "Alex Rivera" } },
      { userId: { name: "Amy Sharma" } },
      { userId: { name: "Ben Rosen" } },
      { userId: { name: "Chloe Park" } },
      { userId: { name: "Daniel Osei" } },
      { userId: { name: "Fatima Zaidi" } },
      { userId: { name: "Hassan Ali" } },
      { userId: { name: "Nora Flores" } },
    ],
    yourBalance: 355,
    totalSpent: 890,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    _id: "g6",
    name: "Roommates",
    members: [
      { userId: { name: "Alex Rivera" } },
      { userId: { name: "Riley Chen" } },
    ],
    yourBalance: 0,
    totalSpent: 4200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  },
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

const fmt = (n) =>
  `${n < 0 ? "−" : n > 0 ? "+" : ""}PKR ${Math.abs(n).toLocaleString()}`;

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (USE_MOCK) {
      const t = setTimeout(() => {
        setGroups(MOCK_GROUPS);
        setLoading(false);
      }, 550);
      return () => clearTimeout(t);
    }

    const controller = new AbortController();
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get(
          "https://split-ex-backend.vercel.app/groups",
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        setGroups(data?.Groups || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Groups fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
    return () => controller.abort();
  }, [token]);

  /* ---------- open a group ---------- */
  const handleOpen = async (g) => {
    try {
      if (!USE_MOCK) {
        await axios.get(
          `https://split-ex-backend.vercel.app/group/${g._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setSelectedGroup(g);
    } catch (err) {
      console.error("Open group error:", err);
    }
  };

  /* ---------- derived ---------- */
  const featured = useMemo(() => {
    if (groups.length === 0) return null;
    return [...groups].sort(
      (a, b) =>
        Math.abs(b.yourBalance ?? 0) + (b.totalSpent ?? 0) * 0.001 -
        (Math.abs(a.yourBalance ?? 0) + (a.totalSpent ?? 0) * 0.001)
    )[0];
  }, [groups]);

  const rest = useMemo(
    () => groups.filter((g) => g._id !== featured?._id),
    [groups, featured]
  );

  const totalMembers = groups.reduce((s, g) => s + (g.members?.length || 0), 0);
  const youAreOwed = groups
    .filter((g) => (g.yourBalance ?? 0) > 0)
    .reduce((s, g) => s + g.yourBalance, 0);
  const youOwe = Math.abs(
    groups
      .filter((g) => (g.yourBalance ?? 0) < 0)
      .reduce((s, g) => s + g.yourBalance, 0)
  );

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
    .toUpperCase();

  /* ============================================================
     RENDER — small card
     ============================================================ */
  const SmallGroupCard = ({ g, index }) => {
    const bal = Number(g.yourBalance ?? 0);
    const tone = bal > 0 ? "pos" : bal < 0 ? "neg" : "zero";
    const memberNames = (g.members || [])
      .map((m) => m.userId?.name)
      .filter(Boolean);
    const visible = memberNames.slice(0, 4);
    const extra = memberNames.length - visible.length;

    return (
      <motion.button
        type="button"
        className={`gr-card gr-card-sm is-${tone}`}
        onClick={() => handleOpen(g)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 * index }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className={`gr-card-corner is-${tone}`} aria-hidden="true" />

        <div className="gr-card-head">
          <span className={`gr-card-avatar is-${toneFor(g.name)}`}>
            {initialsOf(g.name)}
          </span>
          <span className={`gr-card-value is-${tone}`}>{fmt(bal)}</span>
        </div>

        <h3 className="gr-card-name">{g.name}</h3>
        <p className="gr-card-meta">
          {g.members?.length || 0} members
        </p>

        <div className="gr-card-members">
          {visible.map((n, i) => (
            <span
              key={i}
              className={`gr-chip is-${toneFor(n)}`}
              title={n}
            >
              {initialsOf(n)}
            </span>
          ))}
          {extra > 0 && <span className="gr-chip is-more">+{extra}</span>}
        </div>
      </motion.button>
    );
  };

  /* ============================================================
     RENDER — featured card
     ============================================================ */
  const FeaturedCard = ({ g }) => {
    const bal = Number(g.yourBalance ?? 0);
    const tone = bal > 0 ? "pos" : bal < 0 ? "neg" : "zero";
    const memberNames = (g.members || [])
      .map((m) => m.userId?.name)
      .filter(Boolean);

    return (
      <motion.button
        type="button"
        className={`gr-card gr-featured is-${tone}`}
        onClick={() => handleOpen(g)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.995 }}
      >
        <span className="gr-featured-tape">FEATURED</span>
        <span className={`gr-card-corner is-${tone}`} aria-hidden="true" />

        <div className="gr-featured-head">
          <span className={`gr-card-avatar is-${toneFor(g.name)} gr-avatar-lg`}>
            {initialsOf(g.name)}
          </span>
          <div className="gr-featured-head-text">
            <span className="gr-featured-kicker">Most active group</span>
            <h3 className="gr-featured-name">{g.name}</h3>
          </div>
        </div>

        <div className="gr-featured-stats">
          <div className="gr-featured-stat">
            <span className="gr-featured-stat-label">YOUR BALANCE</span>
            <span className={`gr-featured-stat-value is-${tone}`}>
              {fmt(bal)}
            </span>
          </div>
          <div className="gr-featured-stat">
            <span className="gr-featured-stat-label">MEMBERS</span>
            <span className="gr-featured-stat-value">
              {g.members?.length || 0}
            </span>
          </div>
          {typeof g.totalSpent === "number" && (
            <div className="gr-featured-stat">
              <span className="gr-featured-stat-label">TOTAL SPENT</span>
              <span className="gr-featured-stat-value">
                PKR {g.totalSpent.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="gr-featured-members">
          <span className="gr-featured-members-label">Members</span>
          <div className="gr-featured-members-list">
            {memberNames.slice(0, 6).map((n, i) => (
              <span key={i} className={`gr-chip is-${toneFor(n)}`} title={n}>
                {initialsOf(n)}
              </span>
            ))}
            {memberNames.length > 6 && (
              <span className="gr-chip is-more">
                +{memberNames.length - 6}
              </span>
            )}
          </div>
        </div>

        <div className="gr-featured-cta">
          <span>Open group</span>
          <span className="gr-featured-arrow">→</span>
        </div>
      </motion.button>
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="gr-root">
      {/* ============ ANIMATED BG ============ */}
      <div className="gr-bg" aria-hidden="true">
        <div className="gr-bg-orbit" />
        <div className="gr-bg-ring gr-bg-ring-1" />
        <div className="gr-bg-ring gr-bg-ring-2" />
        <div className="gr-bg-grain" />
      </div>

      {selectedGroup ? (
        <GroupPage
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          token={token}
        />
      ) : (
        <>
          {/* ============ HERO ============ */}
          <motion.header
            className="gr-hero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gr-hero-tint" aria-hidden="true" />
            <div className="gr-hero-tape" aria-hidden="true">
              GROUPS · {groups.length} ACTIVE
            </div>

            <div className="gr-hero-inner">
              <div className="gr-hero-eyebrow">
                <span className="gr-dot" />
                {today}
                <span className="gr-hero-pill">LIVE</span>
              </div>

              <div className="gr-hero-row">
                <div>
                  <h1 className="gr-hero-title">
                    Your <em>circles</em>.
                  </h1>
                  <p className="gr-hero-sub">
                    Trips, roommates, dinners, clubs — all in one place.
                  </p>
                </div>

                <button
                  type="button"
                  className="gr-hero-create"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span className="gr-hero-create-plus">+</span>
                  New group
                </button>
              </div>
            </div>
          </motion.header>

          {/* ============ STATS STRIP ============ */}
          <motion.section
            className="gr-stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            {[
              { k: "GROUPS",  v: groups.length, tone: "mute" },
              { k: "MEMBERS", v: totalMembers,  tone: "mustard" },
              { k: "OWED TO YOU", v: `+${youAreOwed.toLocaleString()}`, tone: "pos" },
              { k: "YOU OWE",     v: `−${youOwe.toLocaleString()}`,     tone: "neg" },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                className={`gr-stat is-${s.tone}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
              >
                <span className="gr-stat-label">{s.k}</span>
                <span className="gr-stat-value">
                  {loading ? "—" : s.v}
                </span>
                <span className="gr-stat-corner" aria-hidden="true" />
              </motion.div>
            ))}
          </motion.section>

          {/* ============ CONTENT ============ */}
          {loading ? (
            <div className="gr-skeleton-grid">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="gr-skel-card">
                  <span className="gr-skel gr-skel-avatar" />
                  <span className="gr-skel gr-skel-name" />
                  <span className="gr-skel gr-skel-meta" />
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <motion.div
              className="gr-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="gr-empty-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9 16.6 16.9 15.8 16.2C15.1 15.4 14.1 15 13 15H5C3.9 15 2.9 15.4 2.2 16.2C1.4 16.9 1 17.9 1 19V21M9 11C11.2 11 13 9.2 13 7C13 4.8 11.2 3 9 3C6.8 3 5 4.8 5 7C5 9.2 6.8 11 9 11Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="gr-empty-title">No groups yet.</h3>
              <p className="gr-empty-sub">
                Create your first group to start tracking shared expenses.
              </p>
              <button
                type="button"
                className="gr-empty-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Create your first group
              </button>
            </motion.div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <motion.section
                  className="gr-featured-wrap"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <FeaturedCard g={featured} />
                </motion.section>
              )}

              {/* All groups */}
              <motion.section
                className="gr-all"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="gr-all-head">
                  <span className="gr-card-label">All groups</span>
                  <span className="gr-card-meta">
                    {rest.length} more
                  </span>
                </div>

                <div className="gr-grid">
                  <AnimatePresence initial={false}>
                    {rest.map((g, i) => (
                      <SmallGroupCard key={g._id} g={g} index={i} />
                    ))}
                  </AnimatePresence>
                </div>

                {rest.length === 0 && groups.length > 0 && (
                  <div className="gr-all-foot">
                    <span className="gr-all-line" />
                    <span className="gr-all-text">That's the only one</span>
                    <span className="gr-all-line" />
                  </div>
                )}
              </motion.section>
            </>
          )}
        </>
      )}

      <CreateGroup
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Groups;