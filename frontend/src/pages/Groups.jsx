import React, { useEffect, useState } from 'react';
import "../styles/Group.css";
import CreateGroup from '../Components/CreateGroup';
import GroupPage from '../Components/GroupPage';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Groups = () => {
  const [group, setGroup] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token')

  const handleCreateGroup = () => {
    setIsModalOpen(true);
  };

  const handleOpen = async (group) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://split-ex-backend.vercel.app/group/${group._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedGroup(group); 
      console.log(group)
    } catch (error) {
      console.error("Error fetching group:", error);
      alert("Failed to fetch group data");
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('https://split-ex-backend.vercel.app/groups', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setGroup(response.data.Groups);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className='groups-page'>
      {/* Background Elements */}
      <div className="groups-background-elements">
        <div className="groups-glow groups-glow-1"></div>
        <div className="groups-glow groups-glow-2"></div>
      </div>

      <div className="groups-content">
        {!selectedGroup ? (
          <>
            {/* Header Section */}
            <motion.div 
              className="groups-header glass-card"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="header-content">
                <motion.h2 
                  className="groups-title"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  Your Groups
                </motion.h2>
                <p className="groups-subtitle">Manage and organize your expense groups</p>
              </div>
              
              <motion.button 
                className="create-group-btn"
                onClick={handleCreateGroup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Create New Group
              </motion.button>
            </motion.div>

            {/* Groups List */}
            <motion.div 
              className="groups-list-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {loading ? (
                <div className="loading-state glass-card">
                  <div className="loading-spinner"></div>
                  <p>Loading groups...</p>
                </div>
              ) : group.length === 0 ? (
                <motion.div 
                  className="empty-groups glass-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3>No Groups Found</h3>
                  <p>Create your first group to start managing expenses</p>
                  <motion.button 
                    className="create-first-group-btn"
                    onClick={handleCreateGroup}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create Your First Group
                  </motion.button>
                </motion.div>
              ) : (
                <div className="groups-grid">
                  <AnimatePresence>
                    {group.map((g, index) => (
                      <motion.div
                        key={g._id}
                        className="group-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ 
                          scale: 1.02,
                          y: -2,
                          transition: { type: "spring", stiffness: 300 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="group-card-content">
                          <div className="group-left-section">
                            <div className="group-avatar">
                              {g.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="group-info">
                              <h3 className="group-name">{g.name}</h3>
                              <p className="group-members">
                                {g.members.length} members
                              </p>
                              <p className="group-member-names">
                                {g.members.map(m => m.userId?.name).join(", ")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="group-right-section">
                            <motion.button
                              className="open-group-btn"
                              onClick={() => handleOpen(g)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Open
                            </motion.button>
                          </div>
                        </div>
                        
                        {/* Status indicator bar */}
                        <div className="status-bar active-bar"></div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <GroupPage group={selectedGroup} onClose={() => setSelectedGroup(null)} token={token} />
        )}

        <CreateGroup
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Groups;