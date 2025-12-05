import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import "../styles/navbar.css"
import profile from "../assets/profile.png"
import axios from 'axios'

const Navbar = ({ toggleSidebar }) => {
  const [name, setName] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isProfileHovered, setIsProfileHovered] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('https://split-ex-backend.vercel.app/profile',
          {
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        )
        setName(response.data.user.name)
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
    fetchUser()
  }, [])

  return (
    <motion.div 
      className="navbar-glass"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Background Elements */}
      <div className="navbar-background">
        <div className="nav-glow nav-glow-1"></div>
        <div className="nav-glow nav-glow-2"></div>
      </div>

      <div className="navbar-content">
        {/* Sidebar Toggle Button */}
        <motion.button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.button>

        {/* Search Bar */}
        <motion.div 
          className="search-container"
          animate={{
            scale: isSearchFocused ? 1.02 : 1,
            boxShadow: isSearchFocused 
              ? "0 8px 30px rgba(102, 126, 234, 0.15)" 
              : "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for friends or groups..."
            className="search-input"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                className="search-active-indicator"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="nav-divider"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        />

        {/* Profile Section */}
        <motion.div 
          className="profile-section"
          onHoverStart={() => setIsProfileHovered(true)}
          onHoverEnd={() => setIsProfileHovered(false)}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="profile-avatar-container"
            animate={{
              boxShadow: isProfileHovered 
                ? "0 8px 25px rgba(102, 126, 234, 0.3)" 
                : "0 4px 15px rgba(0, 0, 0, 0.1)"
            }}
          >
            <img 
              src={profile} 
              alt="profile" 
              className="profile-avatar"
            />
            <motion.div 
              className="profile-status"
              animate={{ 
                scale: isProfileHovered ? 1.2 : 1,
                backgroundColor: isProfileHovered ? "#10b981" : "#667eea"
              }}
            />
          </motion.div>

          <div className="profile-info">
            <motion.p 
              className="profile-name"
              animate={{ color: isProfileHovered ? "#667eea" : "#374151" }}
            >
              {name || "Loading..."}
            </motion.p>
            <motion.p 
              className="profile-role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Premium Member
            </motion.p>
          </div>

          {/* Profile Dropdown Arrow */}
          <motion.div
            className="profile-arrow"
            animate={{ rotate: isProfileHovered ? 180 : 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          {/* Hover Effect */}
          <AnimatePresence>
            {isProfileHovered && (
              <motion.div
                className="profile-hover-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Border Glow */}
      <motion.div 
        className="navbar-bottom-glow"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      />
    </motion.div>
  )
}

export default Navbar