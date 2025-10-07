module.exports = (io, socket) => {
    socket.on("Chatmessage", async ({ groupId, message }) => {
      try {
        console.log(`📩 Server received Chatmessage from ${socket.id}`, { groupId, message });
  
        io.in(groupId).emit("Chatmessage", { groupId, message });
  
        console.log(`📤 Server emitted Chatmessage to room ${groupId}`);
      } catch (error) {
        console.error("Chatmessage error:", error);
        socket.emit("Error", { message: "Something went wrong" });
      }
    });
  };
  