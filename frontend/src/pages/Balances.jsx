import React, { useState, useEffect } from "react";
import BalanceCard from "../Components/BalanceCard";
import axios from "axios";
import { motion } from "framer-motion";
import "../styles/BalanceCard.css";

const Balances = () => {
  const [balances, setBalances] = useState([]);
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5); // Start with 5 items

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://split-ex-backend.vercel.app/balances', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          const balance = response.data.balance;
          const name = response.data.names;
          
          const merge = balance.map((bal, index) => ({
            net: bal.net,
            name: name[index]
          }));
          
          setBalances(merge);
        }
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 5); // Load 5 more items
  };

  // Get currently displayed balances
  const displayedBalances = balances.slice(0, displayCount);

  // Calculate summary statistics
  const totalPositive = balances.filter(b => b.net > 0).length;
  const totalNegative = balances.filter(b => b.net < 0).length;
  const settled = balances.filter(b => b.net === 0).length;

  // Check if there are more balances to load
  const hasMore = displayCount < balances.length;

  return (
    <div className="balances-container">
      {/* Animated Background Elements */}
      <div className="balances-background-elements">
        <div className="balances-glow balances-glow-1"></div>
        <div className="balances-glow balances-glow-2"></div>
      </div>

      <div className="balances-content">
        {/* Header Section */}
        <motion.div 
          className="balances-header glass-card"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="balances-title"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            All Balances
          </motion.h2>
          <p className="balances-subtitle">
            Showing {displayedBalances.length} of {balances.length} balances
          </p>
          
          {/* Summary Cards */}
          <motion.div 
            className="summary-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="summary-card">
              <div className="summary-icon positive">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="summary-content">
                <span className="summary-count">{totalPositive}</span>
                <span className="summary-label">Will Receive</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon negative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="summary-content">
                <span className="summary-count">{totalNegative}</span>
                <span className="summary-label">Will Pay</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon settled">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 12L10 15L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="summary-content">
                <span className="summary-count">{settled}</span>
                <span className="summary-label">Settled Up</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Balances List */}
        <motion.div 
          className="balances-list-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {loading ? (
            <div className="loading-state glass-card">
              <div className="loading-spinner"></div>
              <p>Loading balances...</p>
            </div>
          ) : balances.length === 0 ? (
            <motion.div 
              className="empty-balances glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>No Balances Found</h3>
              <p>All expenses are settled up between members</p>
            </motion.div>
          ) : (
            <>
              <div className="balances-list">
                {displayedBalances.map((balance, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <BalanceCard balance={balance} />
                  </motion.div>
                ))}
              </div>

              {hasMore && (
  <motion.div 
    className="load-more-container"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
  >
    <button 
      className="load-more-button"
      onClick={handleLoadMore}
    >
      <span>Load More</span>
      <span className="load-more-count">
        ({Math.min(5, balances.length - displayCount)} more)
      </span>
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="load-more-icon"
      >
        <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </motion.div>
)}

              {/* Show message when all balances are loaded */}
              {!hasMore && balances.length > 5 && (
                <motion.div 
                  className="all-loaded-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p>All balances loaded ✓</p>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Balances;