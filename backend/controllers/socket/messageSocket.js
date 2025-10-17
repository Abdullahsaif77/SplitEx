module.exports = (io, socket) => {
  socket.on("Chatmessage", async ({ groupId, message }) => {
    try {
      console.log(`📩 Chat message from ${socket.userId} in group ${groupId}:`, message);

      // Validate input
      if (!groupId || !message) {
        return socket.emit("error", { message: "Missing groupId or message" });
      }

      // ✅ Enhanced message with proper user info
      const enhancedMessage = {
        ...message,
        userId: socket.userId, // Actual user ID from authentication
        sender: socket.userId, // Use this to identify if message is from current user
        text: message.text,
        timestamp: new Date().toISOString(),
        isOwnMessage: false // This will help frontend identify message ownership
      };

      // Broadcast to room (including sender)
      io.to(groupId).emit("Chatmessage", { 
        groupId, 
        message: enhancedMessage 
      });

      console.log(`📤 Broadcasted message to room ${groupId}`);

    } catch (error) {
      console.error("❌ Chatmessage error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });
};