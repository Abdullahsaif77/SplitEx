import React, { useState, useEffect } from "react";
import "../styles/settlementModel.css";
import axios from "axios";
import { motion } from "framer-motion";

const SettlementModal = ({ isOpen, onClose, onSave, isSettlement }) => {
  const [date, setDate] = useState("");
  const [groups, setGroups] = useState([]);
  const [Name, setName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [pickedGroup, setPickedGroup] = useState({});
  const [payerId, setPayerId] = useState("");

  const [formData, setFormData] = useState({
    groupId: "",
    payer: {},
    receiver: {},
    amount: 0,
    createdBy: "",
  });

  // Reset date when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split("T")[0]);
      setFormData((prev) => ({ ...prev, amount: 0, receiver: {} }));
    }
  }, [isOpen]);

  // Fetch groups + logged-in user
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://split-ex-backend.vercel.app/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const fetchedGroups = response.data.Groups;
          setGroups(fetchedGroups);
          setName(response.data.LoggedIn.name);
          setPayerId(response.data.LoggedIn._id);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  // When group changes, update formData
  useEffect(() => {
    if (!selectedGroup) return;
    const picked = groups.find((g) => g.name === selectedGroup);
    setPickedGroup(picked);

    if (picked) {
      setFormData((prev) => ({
        ...prev,
        groupId: picked._id,
        payer: { userId: payerId, name: Name },
        createdBy: payerId,
      }));
    }
  }, [selectedGroup, groups, payerId, Name]);

  // Save settlement (offline DB save)
  const handleSubmit = async (event) => {
    event.preventDefault();

    const finalData = {
      groupId: formData.groupId,
      payer: formData.payer.userId,
      receiver: formData.receiver.userId,
      amount: parseFloat(formData.amount) || 0,
      createdBy: formData.createdBy,
      currency: "PKR",
      date,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://split-ex-backend.vercel.app/group/${finalData.groupId}/settle`,
        finalData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        console.log("Settlement saved:", response.data);
        onSave(response.data.settlement);
        onClose();
      }
    } catch (error) {
      console.error("Error saving settlement:", error.response?.data || error);
    }
  };

  if (!isOpen) return null;

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            💰 New Settlement
          </motion.h3>
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.button>
        </div>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit}>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="form-label">Select Group</label>
            <select
              className="form-input"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Pick the group</option>
              {groups.map((group, index) => (
                <option key={index} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="payment-flow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flow-party">
              <div className="flow-avatar sender">{getInitials(Name)}</div>
              <span className="flow-name">{Name}</span>
            </div>

            <div className="flow-direction">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flow-party receiver">
              <motion.select
                className="flow-select"
                required
                value={formData.receiver.userId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedMember = pickedGroup?.members?.find(
                    (m) => m.userId?._id === selectedId
                  );

                  setFormData((prev) => ({
                    ...prev,
                    receiver: {
                      userId: selectedId,
                      name: selectedMember?.userId?.name,
                    },
                  }));
                }}
                whileFocus={{ scale: 1.02 }}
              >
                <option value="" disabled>
                  Select recipient...
                </option>
                {pickedGroup?.members?.map((member, index) => (
                  <option value={member.userId?._id} key={index}>
                    {member.userId?.name}
                  </option>
                ))}
              </motion.select>
            </div>
          </motion.div>

          <motion.div
            className="form-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="form-group">
              <label className="form-label">Amount</label>
              <div className="input-with-currency">
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  required
                />
                <select className="currency-dropdown" disabled>
                  <option>PKR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="modal-footer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="save-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SettlementModal;
