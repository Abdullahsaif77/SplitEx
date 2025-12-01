import React, { useState, useEffect, useRef } from "react";
import "../styles/GroupPage.css";
import Member from "./Member";
import Expense from "../Components/ExpenseModel";
import Settlement from "../Components/SettlementModal";
import { createSocket } from "../utils/socket";
import { motion, AnimatePresence } from 'framer-motion';

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
  const [joined, setJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const chatBodyRef = useRef(null);

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

    const handleChatMessage = ({ groupId, message }) => {
      console.log("📩 Received chat message for group:", groupId, message);
      if (groupId === group._id) {
        const isOwnMessage = message.userId === socketRef.current?.userId;

        const formattedMessage = {
          ...message,
          sender: isOwnMessage ? "You" : `User ${message.userId}`,
          isOwn: isOwnMessage
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

    socket.on("connect", handleConnect);
    socket.on("Joined group", handleJoinGroup);
    socket.on("error", handleJoinError);
    socket.on("Chatmessage", handleChatMessage);
    socket.on("connect_error", handleConnectError);

    socket.onAny((event, ...args) => {
      console.log(`🎯 [${event}]`, args);
    });

    return () => {
      console.log("🧹 Cleaning up socket connection");
      socket.off("connect", handleConnect);
      socket.off("Joined group", handleJoinGroup);
      socket.off("error", handleJoinError);
      socket.off("Chatmessage", handleChatMessage);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [token, group?._id]);

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

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    if (!socketRef.current || !joined) {
      console.warn("⚠️ Cannot send message: not connected or not joined to group yet");
      return;
    }

    const msg = {
      sender: "You",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("Chatmessage", {
      groupId: group._id,
      message: msg,
    });

    setNewMessage("");
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="group-chat-page">
      {/* Background Elements */}
      <div className="group-chat-background-elements">
        <div className="group-chat-glow group-chat-glow-1"></div>
        <div className="group-chat-glow group-chat-glow-2"></div>
      </div>

      <div className="group-chat-container glass-card">
        {/* Header */}
        <motion.div
          className="group-chat-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="group-chat-info">
            <div className="group-chat-avatar">
              {getInitials(group?.name || "Group")}
            </div>
            <div>
              <h3 className="group-chat-name">{group?.name || "Group Name"}</h3>
              <p className="group-chat-members">
                {group?.members?.length || 0} members • {joined ? "Connected" : "Connecting..."}
              </p>
            </div>
          </div>

          <div className="group-chat-actions">
            <motion.button
              className="group-chat-action-btn group-chat-add-member-btn"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Member
            </motion.button>
            <motion.button
              className="group-chat-action-btn group-chat-add-expense-btn"
              onClick={() => setIsExpense(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 20V4M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Expense
            </motion.button>
            <motion.button
              className="group-chat-action-btn group-chat-settlement-btn"
              onClick={() => setIsSettlement(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 12H17M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Settlement
            </motion.button>
          </div>
        </motion.div>

        {/* Chat Body */}
        <motion.div
          className="group-chat-body"
          ref={chatBodyRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {messages.length === 0 ? (
            <div className="group-chat-empty">
              <div className="group-chat-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h4>Start a conversation</h4>
              <p>Send your first message to begin chatting with group members</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`group-chat-message ${msg.sender === "You" ? "sent" : "received"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.sender !== "You" && (
                    <div className="group-chat-message-sender">
                      <span className="group-chat-sender-name">{msg.sender}</span>
                    </div>
                  )}
                  <div className="group-chat-message-bubble">
                    <p className="group-chat-message-text">{msg.text}</p>
                    <span className="group-chat-message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Chat Input */}
        <motion.div
          className="group-chat-input-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="group-chat-input-container">
            <input
              type="text"
              className="group-chat-message-input"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <motion.button
              className="group-chat-send-button"
              onClick={handleSend}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!newMessage.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Send
            </motion.button>
          </div>

          {/* Connection Status */}
          <div className="group-chat-connection-status">
            <span className={`group-chat-status-indicator ${connectionStatus === "Connected" ? "connected" : "disconnected"}`}>
              <span className="group-chat-status-dot"></span>
              {connectionStatus}
            </span>
            {joined && <span className="group-chat-room-status">• In Room</span>}
          </div>
        </motion.div>

        {/* Modals */}
        <Member isOpen={isOpen} setisOpen={setIsOpen} group={group} />
        <Expense
          isExpense={isExpense}
          onClose={() => setIsExpense(false)}
          formData={formData}
          setformData={setFormData}
        />
        <Settlement isOpen={isSettlement} onClose={() => setIsSettlement(false)} />
      </div>
    </div>
  );
};

export default GroupPage;