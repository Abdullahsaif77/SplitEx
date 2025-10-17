import React, { useState, useEffect } from "react";
import "../styles/ExpenseModel.css";
import axios from "axios";

const ExpenseModal = ({ isOpen, onClose, formData, setformData, isExpense }) => {
  const isVisible = isOpen || isExpense

  if(!isVisible) return null

  const [groups, setGroups] = useState([]);
  const [selectGroup, setSelectGroup] = useState(null);
  const [alert, setAlert] = useState(false);

  // ✅ Fetch groups when modal opens
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5500/groups", {
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
        `http://localhost:5500/group/${payload.groupId}/expenses`,
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
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="modalContent premiumAnimate"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modalTitle">✨ New Expense</h2>

        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="formGroup">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              placeholder="e.g. Pizza, Hotel bill..."
              value={formData.description || ""}
              onChange={(e) =>
                setformData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Group Selection */}
          <div className="formGroup">
            <label htmlFor="group">Group</label>
            <select
              id="group"
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
          </div>

          {/* Payer Selection */}
          <div className="formGroup">
            <label htmlFor="payer">Paid by</label>
            <select
              id="payer"
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
          </div>

          {/* Participants */}
          <div className="formGroup">
            <label>Participants</label>
            <div className="participantsList">
              {selectGroup?.members?.map((member) => (
                <label key={member.userId?._id} className="checkboxLabel">
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
                              selectedId === prev.payer // ✅ don’t remove payer
                          ),
                        }));
                      }
                    }}
                  />
                  <span className="customCheckbox"></span>
                  {member.userId?.name}
                </label>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="amount">Amount</label>
              <div className="inputWithCurrency">
                <input
                  id="amount"
                  type="number"
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
                  className="currencyDropdown"
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

            <div className="formGroup">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={formData.date || ""}
                onChange={(e) =>
                  setformData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Split Method */}
          <div className="formGroup">
            <label>Split Method</label>
            <select
              value={formData.split || "equal"}
              onChange={(e) =>
                setformData((prev) => ({ ...prev, split: e.target.value }))
              }
            >
              <option value="equal">Equal</option>
              <option value="percentage">Percentage</option>
              <option value="exact">Exact</option>
            </select>
          </div>

          {/* Actions */}
          <div className="actions">
            <button type="button" className="cancelButton" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="saveButton">
              Save <span className="enterHint">↵ Enter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
