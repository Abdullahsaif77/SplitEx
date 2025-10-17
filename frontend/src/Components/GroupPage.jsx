import React, { useState, useEffect, useRef } from "react";
import "../styles/GroupPage.css";
import "../styles/Model.css";
import Member from "./Member";
import Expense from "../Components/ExpenseModel";
import Settlement from "../Components/SettlementModal";
import { createSocket } from "../utils/socket";

const GroupPage = ({ group, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpense, setIsExpense] = useState(false);
  const [isSettlement, setIsSettlement] = useState(false);
  const [formData, setFormData] = useState({
    groupId: group?._id || "",
    createdBy: "",
    payer: "",
    amount: 0,
    description: "",
    split: "equal",
    participants: [],
  });

  const socketRef = useRef(null);
  const [joined, setJoined] = useState(false); // check if joined room

  // ✅ Connect socket and join group
 // In GroupPage component - replace the useEffect
// In GroupPage component - replace the useEffect
useEffect(() => {
  console.log("🎯 GroupPage useEffect triggered", {
    hasToken: !!token,
    hasGroup: !!group,
    groupId: group?._id
  });

  if (!token) {
    console.error("❌ No token provided - cannot connect socket");
    return;
  }

  if (!group?._id) {
    console.error("❌ No group ID provided - cannot join room");
    return;
  }

  console.log("🔄 Initializing socket connection...");
  const socket = createSocket(token);
  socketRef.current = socket;

  const handleConnect = () => {
    console.log("🔌 Socket connected, joining group:", group._id);
    socket.emit("JoinGroup", { 
      roomId: group._id, 
      roomName: group.name 
    });
  };

  const handleJoinGroup = (data) => {
    console.log("✅ Successfully joined group:", data);
    setJoined(true);
  };

  const handleJoinError = (error) => {
    console.error("❌ Failed to join group:", error);
    setJoined(false);
  };

 // In your GroupPage useEffect, update the Chatmessage handler:
const handleChatMessage = ({ groupId, message }) => {
  console.log("📩 Received chat message for group:", groupId, message);
  if (groupId === group._id) {
    // ✅ Determine if this message is from the current user
    const isOwnMessage = message.userId === socketRef.current?.userId;
    
    const formattedMessage = {
      ...message,
      // ✅ Use "You" for own messages, otherwise show sender name
      sender: isOwnMessage ? "You" : `User ${message.userId}`,
      isOwn: isOwnMessage // Add this flag for styling
    };
    
    setMessages((prev) => [...prev, formattedMessage]);
  }
};

  const handleConnectError = (error) => {
    console.error("❌ Socket connection error:", {
      message: error.message,
      description: error.description,
      context: error.context
    });
    setJoined(false);
  };

  // Event listeners
  socket.on("connect", handleConnect);
  socket.on("Joined group", handleJoinGroup);
  socket.on("error", handleJoinError);
  socket.on("Chatmessage", handleChatMessage);
  socket.on("connect_error", handleConnectError);

  // Log all events for debugging
  socket.onAny((event, ...args) => {
    console.log(`🎯 [${event}]`, args);
  });

  // Cleanup function
  return () => {
    console.log("🧹 Cleaning up socket connection");
    socket.off("connect", handleConnect);
    socket.off("Joined group", handleJoinGroup);
    socket.off("error", handleJoinError);
    socket.off("Chatmessage", handleChatMessage);
    socket.off("connect_error", handleConnectError);
    socket.disconnect();
  };
}, [token, group?._id]); // Only depend on token and group._id

  // 📨 Send chat message
 // 📨 Send chat message - FIXED VERSION
const handleSend = () => {
  if (!newMessage.trim()) return;

  if (!socketRef.current || !joined) {
    console.warn("⚠️ Cannot send message: not connected or not joined to group yet");
    return;
  }

  const msg = {
    sender: "You", // This will be overwritten by server with actual user info
    text: newMessage,
    timestamp: new Date().toISOString(),
  };

  // ✅ Only emit to server - DON'T add to local state here
  socketRef.current.emit("Chatmessage", {
    groupId: group._id,
    message: msg,
  });

  // ❌ REMOVE this line that causes duplicates:
  // setMessages((prev) => [...prev, msg]);
  
  setNewMessage("");
};

  // Add this inside your GroupPage component, before the return statement
const [connectionStatus, setConnectionStatus] = useState("Disconnected");

useEffect(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  const updateStatus = () => {
    setConnectionStatus(socket.connected ? "Connected" : "Disconnected");
  };

  socket.on("connect", () => {
    setConnectionStatus("Connected");
  });

  socket.on("disconnect", () => {
    setConnectionStatus("Disconnected");
    setJoined(false);
  });

  updateStatus();

  return () => {
    socket.off("connect");
    socket.off("disconnect");
  };
}, []);

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
          <button className="btn btn-sm btn-primary me-2 p-2" onClick={() => setIsOpen(true)}>
            Add member
          </button>
          <button className="btn btn-sm btn-light me-2 p-2" onClick={() => setIsExpense(true)}>
            Add Expense
          </button>
          <button className="btn btn-sm btn-warning p-2" onClick={() => setIsSettlement(true)}>
            Settlement
          </button>
        </div>
      </div>

      {/* Chat Body */}
    {/* Chat Body - Updated */}
<div className="chat-body">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`chat-bubble ${msg.sender === "You" ? "sent" : "received"}`}
    >
      {/* Show sender name only for received messages */}
      {msg.sender !== "You" && (
        <strong className="chat-sender">{msg.sender}</strong>
      )}
      <p className="chat-text">{msg.text}</p>
      <small className="chat-timestamp">
        {new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </small>
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

      {/* Modals */}
      <Member isOpen={isOpen} setisOpen={setIsOpen} group={group} />
      <Expense
        isExpense={isExpense}
        onClose={() => setIsExpense(false)}
        formData={formData}
        setformData={setFormData}
      />
      <Settlement isOpen={isSettlement} onClose={() => setIsSettlement(false)} />
      {/* Add this in your JSX somewhere */}
<div className="connection-status">
  <small>
    Socket: <span className={connectionStatus === "Connected" ? "text-success" : "text-danger"}>
      {connectionStatus}
    </span>
    {joined && " • Joined Room"}
  </small>
</div>
    </div>
  );
};

export default GroupPage;
