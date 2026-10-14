import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import home from "../assets/home.png";
import group from "../assets/group.png";
import Expenses from "../assets/expenses.png";
import Settlement from "../assets/Settlement.png";
import profileSetting from "../assets/profileSetting.png";
import logout from "../assets/logout.png";
import balance from "../assets/balance.png";
import users from "../assets/users.png";
import profile from "../assets/profile.png";
import "../styles/sideBar.css";
import { PageContext } from "../apis/Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ closeSidebar }) => {
  const { setActivePage, ActivePage } = useContext(PageContext);
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });

  const menuItems = [
    { key: "Home", icon: home, label: "Home", n: "01" },
    { key: "Balances", icon: balance, label: "Balances", n: "02" },
    { key: "Friends", icon: users, label: "Friends", n: "03" },
    { key: "Groups", icon: group, label: "Groups", n: "04" },
    { key: "Expenses", icon: Expenses, label: "Expenses", n: "05" },
    { key: "Settlements", icon: Settlement, label: "Settlements", n: "06" },
  ];

  const bottomItems = [
    { key: "settings", icon: profileSetting, label: "Settings" },
    { key: "logout", icon: logout, label: "Sign out" },
  ];

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
        setUser({
          name: data?.user?.name || "",
          email: data?.user?.email || "",
        });
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Sidebar user fetch:", err);
      }
    };
    fetchUser();
    return () => controller.abort();
  }, []);

  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join("") || "·";

  const handleLogout = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    try {
      if (token) {
        await axios.post(
          "https://split-ex-backend.vercel.app/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleItemClick = (pageKey) => {
    if (pageKey === "logout") return handleLogout();
    if (pageKey === "settings") {
      closeSidebar?.();
      return;
    }
    setActivePage(pageKey);
    closeSidebar?.();
  };

  const isActive = (key) => ActivePage === key;

  return (
    <div className="sb-root">
      {/* Mobile close */}
      <button
        type="button"
        className="sb-close"
        onClick={closeSidebar}
        aria-label="Close sidebar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Masthead */}
      <motion.div
        className="sb-masthead"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="sb-monogram">S</span>
        <div className="sb-masthead-text">
          <span className="sb-wordmark">SplitEx</span>
          <span className="sb-tagline">SPLIT · SETTLE · REPEAT</span>
        </div>
      </motion.div>

      {/* Nav */}
      <nav className="sb-nav" aria-label="Main navigation">
        <div className="sb-section-head">
          <span className="sb-section-title">Index</span>
          <span className="sb-section-rule" />
        </div>

        <ul className="sb-list">
          {menuItems.map((item, index) => {
            const active = isActive(item.key);
            return (
              <motion.li
                key={item.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.035, duration: 0.28 }}
              >
                <button
                  type="button"
                  className={`sb-item ${active ? "is-active" : ""}`}
                  onClick={() => handleItemClick(item.key)}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="sb-item-num">{item.n}</span>
                  <img src={item.icon} alt="" className="sb-item-icon" />
                  <span className="sb-item-label">{item.label}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        <div className="sb-footer-rule" />

        <div className="sb-user">
          <span className="sb-user-avatar" aria-hidden="true">
            <img src={profile} alt="" className="sb-user-avatar-img" />
            <span className="sb-user-initials">{initials}</span>
          </span>
          <div className="sb-user-text">
            <span className="sb-user-name">{user.name || "Loading…"}</span>
            <span className="sb-user-meta">
              {user.email ? user.email.split("@")[0] : "signed in"}
            </span>
          </div>
        </div>

        <ul className="sb-list sb-list-tight">
          {bottomItems.map((item, index) => (
            <motion.li
              key={item.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.04, duration: 0.28 }}
            >
              <button
                type="button"
                className={`sb-item sb-item-quiet ${
                  item.key === "logout" ? "is-danger" : ""
                }`}
                onClick={() => handleItemClick(item.key)}
              >
                <img src={item.icon} alt="" className="sb-item-icon" />
                <span className="sb-item-label">{item.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;