import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/navbar.css";
import profile from "../assets/profile.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [name, setName] = useState("");
  const [netBalance, setNetBalance] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  /* ---------- Fetch user + balance ---------- */
  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(
          "https://split-ex-backend.vercel.app/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        setName(data?.user?.name || "");

        // If your backend exposes a balance, use it. Otherwise compute later.
        const bal =
          data?.user?.netBalance ??
          data?.netBalance ??
          data?.user?.balance ??
          null;
        if (typeof bal === "number") setNetBalance(bal);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, []);

  /* ---------- Cmd/Ctrl + K opens search ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else setQuery("");
  }, [searchOpen]);

  /* ---------- Derived ---------- */
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("") || "·";

  const today = new Date();
  const dateStamp = today
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .replace(",", "")
    .toUpperCase();

  const balanceLabel =
    netBalance === null
      ? "—"
      : `${netBalance >= 0 ? "+" : "−"}$${Math.abs(netBalance).toFixed(2)}`;
  const balanceTone =
    netBalance === null
      ? "is-muted"
      : netBalance > 0
      ? "is-positive"
      : netBalance < 0
      ? "is-negative"
      : "is-muted";

  return (
    <motion.header
      className="nv-root"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nv-inner">
        {/* ============== LEFT ============== */}
        <div className="nv-left">
          <button
            type="button"
            className={`nv-burger ${isSidebarOpen ? "is-open" : ""}`}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            aria-expanded={isSidebarOpen}
          >
            <span className="nv-burger-line" />
            <span className="nv-burger-line" />
          </button>

          <span className="nv-date" aria-hidden="true">
            {dateStamp}
          </span>
        </div>

        {/* ============== CENTER: search (idle vs open) ============== */}
        <div className="nv-center">
          <AnimatePresence mode="wait" initial={false}>
            {!searchOpen ? (
              <motion.button
                key="trigger"
                type="button"
                className="nv-search-trigger"
                onClick={() => setSearchOpen(true)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="nv-search-trigger-label">Search</span>
                <kbd className="nv-kbd">⌘K</kbd>
              </motion.button>
            ) : (
              <motion.div
                key="input"
                className="nv-search-input"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search friends, groups, expenses…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => setSearchOpen(false)}
                />
                <kbd className="nv-kbd nv-kbd-esc">ESC</kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============== RIGHT ============== */}
        <div className="nv-right">
          {/* Balance chip */}
          <button
            type="button"
            className={`nv-balance ${balanceTone}`}
            onClick={() => navigate("/dashboard") /* route to balances later */}
            title="Your net balance"
          >
            <span className="nv-balance-label">NET</span>
            <span className="nv-balance-value">{balanceLabel}</span>
          </button>

          {/* Notification */}
          <button
            type="button"
            className="nv-icon-btn"
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a1.94 1.94 0 0 0 3.4 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="nv-badge">3</span>
          </button>

          <span className="nv-rule" aria-hidden="true" />

          {/* Profile */}
          <button
            type="button"
            className="nv-profile"
            aria-label={`Signed in as ${name || "user"}`}
          >
            <span className="nv-avatar" aria-hidden="true">
              <img src={profile} alt="" className="nv-avatar-img" />
              <span className="nv-avatar-fallback">{initials}</span>
            </span>
            <span className="nv-profile-text">
              <span className="nv-profile-name">{name || "Loading…"}</span>
              <span className="nv-profile-meta">SIGNED IN</span>
            </span>
          </button>
        </div>
      </div>

      {/* Hairline bottom rule (replaces bottom glow) */}
      <span className="nv-rule-bottom" aria-hidden="true" />
    </motion.header>
  );
};

export default Navbar;