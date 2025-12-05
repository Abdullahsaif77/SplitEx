import React from 'react'
import "../styles/home.css"
import "bootstrap/dist/css/bootstrap.min.css";
import tick from "../assets/tick.png"
import axios from 'axios'
import { useState } from 'react';
import { useEffect } from 'react';
import ActivityFeed from '../Components/ActivityFeed';
import { motion } from 'framer-motion';

const Home = () => {
  const [plusbalance, setplusbalance] = useState(0);
  const [negativebalance, setnegativebalance] = useState(0);
  const [activities, setactivities] = useState([])
  const [you_owe, setyou_owe] = useState("")

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('https://split-ex-backend.vercel.app/home',
          {
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        )
        if (response.status === 200) {
          setyou_owe(response.data.you_owe)
          if (response.data.totalBalance >= 0) {
            console.log(response)
            const bal = Math.round(response.data.totalBalance)
            setplusbalance(bal)
          }
          setactivities(response.data.activities || [])
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
    fetchBalance()
  }, [])

  return (
    <div className='home-container'>
      {/* Animated Background Elements */}
      <div className="home-background-elements">
        <div className="home-glow home-glow-1"></div>
        <div className="home-glow home-glow-2"></div>
      </div>

      {/* Main Content Area with Fixed Height */}
      <div className="home-content">
        {/* Balance Cards Section */}
        <motion.div 
          className="balance-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="balance-card glass-card"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="balance-icon positive">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="balance-content">
              <p className="balance-label">You Get</p>
              <h3 className="balance-amount positive">PKR {plusbalance}</h3>
            </div>
            <div className="balance-glow positive-glow"></div>
          </motion.div>

          <motion.div 
            className="balance-card glass-card"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            <div className="balance-icon negative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="balance-content">
              <p className="balance-label">You Owe</p>
              <h3 className="balance-amount negative">PKR {you_owe}</h3>
            </div>
            <div className="balance-glow negative-glow"></div>
          </motion.div>
        </motion.div>

        {/* Activities Section with Conditional Scroll */}
        <motion.div 
          className="activities-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <motion.h2 
              className="section-title"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Your Activities
            </motion.h2>
            <div className="section-underline"></div>
          </div>

          {/* Conditional Activities Container */}
          <div className="activities-container">
            {activities.length === 0 ? (
              <div className="empty-state-wrapper">
                <motion.div 
                  className="empty-state glass-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="tick-icon"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <img src={tick} alt="All settled" />
                  </motion.div>
                  <h3 className="empty-title">All debts settled up!</h3>
                  <p className="empty-description">
                    Your debts in groups and 1:1 with friends are settled.<br />
                    Add an expense to get paid back!
                  </p>
                  <motion.div 
                    className="pulse-dots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                  </motion.div>
                </motion.div>
              </div>
            ) : (
              <div className="activities-with-data">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <ActivityFeed activities={activities} />
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Home