import React, { useState, useEffect } from "react";
import "../styles/settlementModel.css";
import axios from "axios";

const SettlementModal = ({ isOpen, onClose, onSave }) => {
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
        const response = await axios.get("http://localhost:5500/groups", {
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
      payer: formData.payer,
      receiver: formData.receiver,
      amount: parseFloat(formData.amount) || 0,
      createdBy: formData.createdBy,
      currency: "PKR",
      date,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5500/group/${finalData.groupId}/settle`,
        finalData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        console.log("Settlement saved:", response.data);
      }
    } catch (error) {
      console.error("Error saving settlement:", error.response?.data || error);
    }

    onSave(finalData);
    onClose();
  };

  // Stripe payment
  const handleStripePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        payer: formData.payer,
        receiver: formData.receiver,
        amount: parseInt(formData.amount, 10),
        groupId: formData.groupId,
      };

      const response = await axios.post(
        "http://localhost:5500/stripe/create-checkout-session",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settlementOverlay" onClick={onClose}>
      <div className="settlementContent" onClick={(e) => e.stopPropagation()}>
        <h2>New payment</h2>

        <form onSubmit={handleSubmit}>
          {/* Group */}
          <div className="settlementGroup">
            <label htmlFor="group">Select group</label>
            <div className="settlementSearchable">
              <select
                id="group"
                className="mb-3"
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
            </div>
          </div>

          {/* Flow */}
          <div className="settlementFlow">
            <div className="settlementParty">
              <span>{Name}</span>
            </div>
            <div className="settlementArrow">→</div>
            <div className="settlementParty">
              <div className="settlementRecipient">
                <select
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
                >
                  <option value="" disabled>
                    Recipient...
                  </option>
                  {pickedGroup?.members?.map((member, index) => (
                    <option value={member.userId?._id} key={index}>
                      {member.userId?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amount + Date */}
          <div className="settlementRow">
            <div className="settlementGroup">
              <label htmlFor="amount">Amount</label>
              <div className="settlementAmountInput">
                <input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  required
                />
                <select className="settlementCurrency" disabled>
                  <option>PKR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>
            <div className="settlementGroup">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="settlementActions">
            <button
              type="button"
              className="settlementCancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="settlementSave">
              Save (Offline)
            </button>
            <button
              type="button"
              className="settlementStripe"
              onClick={handleStripePayment}
            >
              Pay Online (Stripe)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlementModal;
