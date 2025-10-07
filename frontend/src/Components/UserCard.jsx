import React from "react";
import "../styles/Users.css";

const UserCard = ({ friend }) => {
  return (
    <div className="user-card">
      <div className="user-info">
        <h3 className="user-name">{friend.name}</h3>
        <p className="user-email">{friend.email}</p>
      </div>
      <span className="badge">Active</span>
    </div>
  );
};

export default UserCard;
