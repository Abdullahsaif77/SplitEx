import React, { useContext } from "react";
import { motion } from "framer-motion";
import home from "../assets/home.png";
import group from "../assets/group.png";
import Expenses from "../assets/expenses.png";
import Settlement from "../assets/Settlement.png";
import profileSetting from "../assets/profileSetting.png";
import logout from "../assets/logout.png";
import balance from "../assets/balance.png";
import users from "../assets/users.png";
import "../styles/sideBar.css";
import { PageContext } from "../apis/Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ closeSidebar }) => {
  const { setActivePage, ActivePage } = useContext(PageContext);
  const navigate = useNavigate();

  const menuItems = [
    { key: "Home", icon: home, label: "Home" },
    { key: "Balances", icon: balance, label: "Balances" },
    { key: "Friends", icon: users, label: "Friends" },
    { key: "Groups", icon: group, label: "Groups" },
    { key: "Expenses", icon: Expenses, label: "Expenses" },
    { key: "Settlements", icon: Settlement, label: "Settlements" },
  ];

  const bottomItems = [
    { key: "settings", icon: profileSetting, label: "Settings" },
    { key: "logout", icon: logout, label: "Log out" },
  ];

  const handleLogout = async () => {
    // Read token BEFORE clearing it
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    // Clear both stores immediately so the UI can't get stuck
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
    } catch (error) {
      // Silent — we already logged the user out locally
      console.error("Logout API error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleItemClick = (pageKey) => {
    if (pageKey === "logout") return handleLogout();

    if (pageKey === "settings") {
      // TODO: navigate("/settings")
      closeSidebar?.();
      return;
    }

    setActivePage(pageKey);
    closeSidebar?.();
  };

  const isActive = (key) => ActivePage === key;

  return (
    <div className="sidebar-inner">
      {/* Mobile close button */}
      <button
        type="button"
        className="sidebar-close-btn"
        onClick={closeSidebar}
        aria-label="Close sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Brand */}
      <motion.div
        className="sidebar-brand"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="brand-badge">S</span>
        <span className="brand-name">SplitEx</span>
      </motion.div>

      {/* Primary nav */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="nav-header">
          <span className="nav-title">Menu</span>
          <span className="nav-rule" />
        </div>

        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <button
                type="button"
                className={`nav-item ${isActive(item.key) ? "is-active" : ""}`}
                onClick={() => handleItemClick(item.key)}
                aria-current={isActive(item.key) ? "page" : undefined}
              >
                <img src={item.icon} alt="" className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive(item.key) && (
                  <span className="nav-active-bar" aria-hidden="true" />
                )}
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Footer items */}
      <div className="sidebar-bottom">
        <div className="sidebar-rule" />

        <ul className="nav-list">
          {bottomItems.map((item, index) => (
            <motion.li
              key={item.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.04, duration: 0.3 }}
            >
              <button
                type="button"
                className={`nav-item nav-item-quiet ${
                  item.key === "logout" ? "is-danger" : ""
                }`}
                onClick={() => handleItemClick(item.key)}
              >
                <img src={item.icon} alt="" className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;