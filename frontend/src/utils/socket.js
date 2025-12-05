
import { io } from "socket.io-client";

const BASE_URL = "https://split-ex-backend.vercel.app";

export const createSocket = (token) => {
  console.log("🔄 Creating socket connection with token:", token ? "Present" : "Missing");
  
  const socket = io(BASE_URL, {
    auth: { 
      token: token 
    },
    transports: ["websocket", "polling"],
    timeout: 10000,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  
  socket.on("connect", () => {
    console.log("✅ Socket connected successfully! ID:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection failed:", error.message);
    console.error("Connection details:", {
      url: BASE_URL,
      tokenPresent: !!token,
      tokenLength: token?.length
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected. Reason:", reason);
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.log("Reconnection attempt:", attempt);
  });

  socket.on("reconnect_failed", () => {
    console.error("All reconnection attempts failed");
  });

  return socket;
};