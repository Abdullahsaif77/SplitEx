import React, { useState } from "react";
import "../styles/GroupPage.css";
import AddMember from "../Components/AddFriend";

const GroupPage = ({ group }) => {
  const [messages, setMessages] = useState([
    { sender: "Huzaifa", text: "Hey! Did you add the expense?" },
    { sender: "Abdullah", text: "Yes, just added it now ✅" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [add, setAdd] = useState(false);
  const [members, setMembers] = useState([]);

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const onRemove = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setAdd(true);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: "You", text: newMessage }]);
    setNewMessage("");
  };

  const handleAddNewMember = () => {
    setMembers([...members, { _id: Date.now(), name: "" }]);
  };

  return (
    <div className="chat-container">
      {/* Navbar */}
      <div className="chat-navbar d-flex justify-content-between align-items-center shadow-sm">
        <div>
          <h5 className="mb-0">{group?.name || "Group Name"}</h5>
          <small className="text-muted">
            {group?.members?.map((m) => m.userId?.name).join(", ") || "Members"}
          </small>
        </div>
        <div>
          <button
            className="btn btn-sm btn-primary me-2 p-2"
            onClick={handleAdd}
          >
            Add member
          </button>
          <button className="btn btn-sm btn-light me-2 p-2">Add Expense</button>
          <button className="btn btn-sm btn-warning p-2">Settlement</button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${
              msg.sender === "You" ? "sent" : "received"
            }`}
          >
            <strong className="chat-sender">{msg.sender}</strong>
            <p className="chat-text">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="chat-input d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>

      {/* Modal for Adding Members */}
      {add && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Add Members</h4>

            {members.map((member, index) => (
              <AddMember
                key={member._id}
                isOpen={true}
                onClose={() => setAdd(false)}
                onChange={(field, value) => updateMember(index, field, value)}
                onRemove={() => onRemove(index)}
              />
            ))}

            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-success" onClick={handleAddNewMember}>
                + Add Another Member
              </button>
              <button className="btn btn-secondary" onClick={() => setAdd(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
