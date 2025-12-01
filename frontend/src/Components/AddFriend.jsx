import React from "react";
import deletePic from "../assets/delete.png";
import { motion } from "framer-motion";

const AddFriend = ({ member, onChange, onRemove }) => {
  return (
    <motion.div 
      className="add-friend-card glass-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="add-friend-header">
        <div className="header-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="member-icon">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M20 8v6m3-3h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h5 className="member-title">Member Details</h5>
        </div>
        <motion.div 
          className="delete-member"
          onClick={onRemove}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.div>
      </div>

      <div className="add-friend-fields">
        <div className="form-field-group">
          <div className="form-field">
            <label className="field-label">Name</label>
            <input
              type="text"
              className="field-input"
              placeholder="Enter member name"
              value={member.name || ""}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              placeholder="Enter member email"
              value={member.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </div>
        </div>

        {/* Optional: Role selection */}
        <div className="form-field">
          <label className="field-label">Role</label>
          <select 
            className="field-select"
            value={member.role || "member"}
            onChange={(e) => onChange("role", e.target.value)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default AddFriend;