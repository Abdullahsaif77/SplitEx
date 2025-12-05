import React, { useState, useEffect } from "react";
import "../styles/ExpenseModel.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const ExpenseModal = ({ isOpen, onClose, formData, setformData, isExpense }) => {
  const isVisible = isOpen || isExpense

  if (!isVisible) return null

  const [groups, setGroups] = useState([]);
  const [selectGroup, setSelectGroup] = useState(null);
  const [alert, setAlert] = useState(false);

  // ✅ Fetch groups when modal opens
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://split-ex-backend.vercel.app/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.Groups?.length > 0) {
          const firstGroup = response.data.Groups[0];
          setGroups(response.data.Groups);
          setSelectGroup(firstGroup);
          setformData((prev) => ({ ...prev, groupId: firstGroup._id }));
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [setformData]);

  // ✅ Handle group change (by _id, not name)
  const handleGroupChange = (e) => {
    const selectedId = e.target.value;
    const foundGroup = groups.find((g) => g._id === selectedId);
    if (foundGroup) {
      setSelectGroup(foundGroup);
      setformData((prev) => ({ ...prev, groupId: foundGroup._id }));
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        groupId: formData.groupId,
        amount: formData.amount,
        description: formData.description,
        currency: formData.currency || "PKR",
        payer: formData.payer,
        method: formData.split,
        participants: formData.participants,
        date: formData.date,
      };

      const response = await axios.post(
        `https://split-ex-backend.vercel.app/group/${payload.groupId}/expenses`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        console.log("✅ Expense saved:", response.data);
        setAlert(true);
        onClose();
      }
    } catch (err) {
      console.error("❌ Error saving expense:", err);
    }
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
            ✨ New Expense
          </motion.h3>
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Pizza, Hotel bill..."
              value={formData.description || ""}
              onChange={(e) =>
                setformData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="form-label">Group</label>
            <select
              className="form-input"
              value={formData.groupId || ""}
              onChange={handleGroupChange}
            >
              <option value="" disabled>
                Select group
              </option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="form-label">Paid by</label>
            <select
              className="form-input"
              value={formData.payer || ""}
              onChange={(e) => {
                const payerId = e.target.value;

                setformData((prev) => {
                  let updatedParticipants = [...prev.participants];
                  if (!updatedParticipants.some((p) => p.userId === payerId)) {
                    updatedParticipants.push({
                      userId: payerId,
                      share: 0,
                      paid: 0,
                    });
                  }
                  return { ...prev, payer: payerId, participants: updatedParticipants };
                });
              }}
            >
              <option value="" disabled>
                Select payer
              </option>
              {selectGroup?.members?.map((member) => (
                <option key={member.userId?._id} value={member.userId?._id}>
                  {member.userId?.name || "Unknown"}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label className="form-label">Participants</label>
            <div className="participants-list">
              {selectGroup?.members?.map((member) => (
                <label key={member.userId?._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={member.userId?._id}
                    checked={formData.participants.some(
                      (p) => p.userId === member.userId?._id
                    )}
                    onChange={(e) => {
                      const selectedId = member.userId?._id;
                      if (!selectedId) return;

                      if (e.target.checked) {
                        setformData((prev) => {
                          if (
                            prev.participants.some((p) => p.userId === selectedId)
                          )
                            return prev;
                          return {
                            ...prev,
                            participants: [
                              ...prev.participants,
                              { userId: selectedId, share: 0, paid: 0 },
                            ],
                          };
                        });
                      } else {
                        setformData((prev) => ({
                          ...prev,
                          participants: prev.participants.filter(
                            (p) =>
                              p.userId !== selectedId ||
                              selectedId === prev.payer // ✅ don't remove payer
                          ),
                        }));
                      }
                    }}
                  />
                  <span className="custom-checkbox"></span>
                  {member.userId?.name}
                </label>
              ))}
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
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setformData((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                />
                <select
                  className="currency-dropdown"
                  value={formData.currency || "PKR"}
                  onChange={(e) =>
                    setformData((prev) => ({ ...prev, currency: e.target.value }))
                  }
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date || ""}
                onChange={(e) =>
                  setformData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
          </motion.div>

          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <label className="form-label">Split Method</label>
            <select
              className="form-input"
              value={formData.split || "equal"}
              onChange={(e) =>
                setformData((prev) => ({ ...prev, split: e.target.value }))
              }
            >
              <option value="equal">Equal</option>
              <option value="percentage">Percentage</option>
              <option value="exact">Exact</option>
            </select>
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
              className="create-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Save Expense
              <span className="enter-hint">↵ Enter</span>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ExpenseModal;