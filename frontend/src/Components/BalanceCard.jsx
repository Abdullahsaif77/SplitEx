import React from "react";
import { motion } from "framer-motion";

const BalanceCard = ({ balance }) => {
  const roundNet = Math.round(balance.net);

  const getColor = (value) => {
    if (value > 0) return "positive-balance";
    if (value < 0) return "negative-balance";
    return "settled-balance";
  };

  const getStatusIcon = (value) => {
    if (value > 0) return "↑";
    if (value < 0) return "↓";
    return "✓";
  };

  const getStatusText = (value) => {
    if (value > 0) return "WILL RECEIVE";
    if (value < 0) return "WILL PAY";
    return "SETTLED UP";
  };

  return (
    <motion.div 
      className="balance-card-wrapper glass-card"
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { type: "spring", stiffness: 300 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="balance-card-content">
        <div className="balance-left-section">
          <div className="user-avatar">
          {balance.name?.charAt(0)?.toUpperCase() ?? ""}
          </div>
          <div className="user-info">
            <h3 className="user-name">{balance.name}</h3>
            <p className="balance-subtext">Net balance summary</p>
          </div>
        </div>
        
        <div className="balance-right-section">
          <div className={`amount-container ${getColor(roundNet)}`}>
            <span className="amount-icon">{getStatusIcon(roundNet)}</span>
            <span className="balance-amount">
              {roundNet > 0 ? `+${roundNet} PKR` : `${roundNet} PKR`}
            </span>
          </div>
          <p className="balance-status">{getStatusText(roundNet)}</p>
        </div>
      </div>
      
      {/* Status indicator bar */}
      <div className={`status-bar ${getColor(roundNet)}`}></div>
    </motion.div>
  );
};

export default BalanceCard;