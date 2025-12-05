import React, { useState } from "react";
import "../styles/createGroup.css";
import AddFriend from "./AddFriend";
import axios from 'axios'
import { motion, AnimatePresence } from "framer-motion";

const CreateGroup = ({ isOpen, onClose }) => {
  const [groupData, setgroupData] = useState({
    name: "",
    members: [],
  });

  const handleSubmit = async(e)=>{
    e.preventDefault()
    try{
      const payload = {
        name : groupData.name,
        members : groupData.members
      }
      const token = localStorage.getItem('token')
      const response = await axios.post('https://split-ex-backend.vercel.app/group' , payload ,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
       )
       if(!response){
        console.log("Something is broken in backend")
        alert("Something is broken in backend")
       }
       if(response.status === 200){
        console.log("Group is created successfully")
        onClose(); // Close modal on success
       }
    }
    catch(error){
      console.log(error)
    }
  }

  const HandleMember = (e) => {
    e.preventDefault();
    setgroupData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          userId: "",
          role: "member",
          _id: Date.now().toString(),
        },
      ],
    }));
  };

  const updateMember = (index, field, value) => {
    const updated = [...groupData.members];
    updated[index][field] = value;
    setgroupData({ ...groupData, members: updated });
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content glass-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <motion.h3 
            className="modal-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Create New Group
          </motion.h3>
          <motion.button 
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Form */}
        <form className="modal-form">
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="form-label">Group Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter group name"
              value={groupData.name}
              onChange={(e) =>
                setgroupData({ ...groupData, name: e.target.value })
              }
            />
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="form-label">Add Members</label>
            
            <AnimatePresence>
              {groupData.members.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AddFriend
                    member={member}
                    onChange={(field, value) => updateMember(index, field, value)}
                    onRemove={() => {
                      const updated = groupData.members.filter((_, i) => i !== index);
                      setgroupData({ ...groupData, members: updated });
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button 
              className="add-member-btn"
              onClick={HandleMember}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Group Member
            </motion.button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div 
          className="modal-footer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button 
            className="cancel-btn"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button 
            className="create-btn"
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Group
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CreateGroup;