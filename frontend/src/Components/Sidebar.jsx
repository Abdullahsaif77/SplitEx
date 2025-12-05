import React from "react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.png";
import home from "../assets/home.png";
import group from "../assets/group.png";
import Expenses from "../assets/expenses.png";
import Settlement from "../assets/Settlement.png";
import profileSetting from "../assets/profileSetting.png";
import logout from "../assets/logout.png";
import balance from "../assets/balance.png";
import users from "../assets/users.png";
import "../styles/sideBar.css";
import { useContext } from "react";
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
    { key: "Settlements", icon: Settlement, label: "Settlements" }
  ];

  const bottomItems = [
    { key: "settings", icon: profileSetting, label: "Profile Settings" },
    { key: "logout", icon: logout, label: "Logout" }
  ];

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optional: Send logout request to backend
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('https://split-ex-backend.vercel.app/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Navigate to login page
      navigate('/login');
      
      // Show success message
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage and redirect even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleItemClick = (pageKey) => {
    if (pageKey === "logout") {
      handleLogout();
      return;
    }
    
    if (pageKey === "settings") {
      console.log("Opening profile settings...");
      // You can add navigation to settings page here
      return;
    }
    
    setActivePage(pageKey);
    closeSidebar();
  };

  const isActive = (key) => ActivePage === key;

  return (
    <div className="sidebar-glass">
      {/* Animated Background Elements */}
      <div className="sidebar-background-elements">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>

      {/* Theme-based decorative line on the right side */}
      <div className="sidebar-decorative-line"></div>

      <motion.button
        className="sidebar-close-btn"
        onClick={closeSidebar}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      {/* Enhanced Logo Section */}
      <motion.div 
        className="sidebar-logo-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo-image" />
          <div className="logo-glow"></div>
        </div>
        <div className="app-name">SplitWise</div>
        <div className="app-tagline">Manage Expenses</div>
      </motion.div>

      {/* Navigation with Proper Sizing */}
      <nav className="sidebar-nav">
        <div className="nav-header">
          <span className="nav-title">MAIN MENU</span>
          <div className="nav-underline"></div>
        </div>
        
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.key}
              className={`nav-item ${isActive(item.key) ? "nav-item-active" : ""}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                x: 8
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick(item.key)}
            >
              <div className="nav-item-content">
                <img 
                  src={item.icon} 
                  alt={item.label}
                  className={`nav-icon ${isActive(item.key) ? "nav-icon-active" : ""}`}
                />
                <span className="nav-label">{item.label}</span>
                {isActive(item.key) && (
                  <motion.div 
                    className="active-arrow"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    →
                  </motion.div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <div className="bottom-divider">
          <div className="divider-line"></div>
          <div className="divider-dot"></div>
          <div className="divider-line"></div>
        </div>
        
        <ul className="nav-list">
          {bottomItems.map((item, index) => (
            <motion.li
              key={item.key}
              className={`nav-item-bottom ${item.key === "logout" ? "logout-item" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: item.key === "logout" 
                  ? "rgba(239, 68, 68, 0.1)" 
                  : "rgba(255,255,255,0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick(item.key)}
            >
              <div className="nav-item-content">
                <img 
                  src={item.icon} 
                  alt={item.label} 
                  className={`nav-icon ${item.key === "logout" ? "logout-icon" : ""}`}
                />
                <span className={`nav-label ${item.key === "logout" ? "logout-label" : ""}`}>
                  {item.label}
                </span>
                {item.key === "logout" && (
                  <motion.div 
                    className="logout-arrow"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    →
                  </motion.div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;