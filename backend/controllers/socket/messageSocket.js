module.exports = (io, socket) => {
  socket.on("Chatmessage", async ({ groupId, message }) => {
    try {
      console.log(`📩 Chat message from ${socket.userId} in group ${groupId}:`, message);

      
      if (!groupId || !message) {
        return socket.emit("error", { message: "Missing groupId or message" });
      }

     
      const enhancedMessage = {
        ...message,
        userId: socket.userId, 
        sender: socket.userId, 
        text: message.text,
        timestamp: new Date().toISOString(),
        isOwnMessage: false 
      };

      
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