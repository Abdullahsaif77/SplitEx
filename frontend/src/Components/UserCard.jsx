import React from "react";
import "../styles/Users.css";
import { motion } from "framer-motion";

const UserCard = ({ friend }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div 
      className="user-card glass-card"
      whileHover={{ 
        scale: 1.05,
        y: -5,
        transition: { type: "spring", stiffness: 300 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="user-card-content">
        <div className="user-avatar-section">
          <div className="user-avatar">
            {getInitials(friend.name)}
          </div>
          <div className="user-info">
            <h3 className="user-name">{friend.name}</h3>
            <p className="user-email">{friend.email}</p>
          </div>
        </div>
        
        <div className="user-status-section">
          <span className="badge active">Active</span>
          <span className="member-since">Member</span>
        </div>
      </div>
      
      {/* Gradient border effect */}
      <div className="card-gradient-border"></div>
    </motion.div>
  );
};

export default UserCard;