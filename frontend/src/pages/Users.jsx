import React from "react";
import UserCard from "../Components/UserCard";
import "../styles/Users.css";
import { useEffect } from "react";
import axios from 'axios'
import { useState } from "react";
import { motion } from "framer-motion";

const Users = () => {
  
const [friends , setfriends] = useState([])
const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetchFriends = async()=>{
      try{
        const response = await axios.get('https://split-ex-backend.vercel.app/friends')
        if(!response){
          return console.log("Something is broken in backend")
          alert('Something is broken in backend')
        }
        setfriends(response.data.Friends)
      }
      catch(error){
        console.error("Error fetching friends:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFriends()
  },[])

  return (
    <div className="users-page">
      {/* Animated Background Elements */}
      <div className="users-background-elements">
        <div className="users-glow users-glow-1"></div>
        <div className="users-glow users-glow-2"></div>
      </div>

      <div className="users-content">
        {/* Header Section */}
        <motion.div 
          className="users-header glass-card"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="users-title"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            All Users
          </motion.h2>
          <p className="users-subtitle">List of registered members in the system</p>
        </motion.div>

        {/* Users List */}
        <motion.div 
          className="users-list-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="loading-state glass-card">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : friends.length === 0 ? (
            <motion.div 
              className="empty-users glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>No Users Found</h3>
              <p>There are no registered users in the system yet</p>
            </motion.div>
          ) : (
            <div className="users-grid">
              {friends.map((friend, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <UserCard friend={friend} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Users;