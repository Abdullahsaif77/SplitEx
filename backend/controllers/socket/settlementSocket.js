const Settlement = require('../../models/settle');

module.exports = (io, socket) => {
  socket.on('settlementCreated', async ({ settlementId, roomId }) => {
    console.log("settlementCreated event received:", settlementId, roomId);

    try {
      const existSettlement = await Settlement.findById(settlementId);

      if (!existSettlement) {
        return socket.emit('SettlementError', { message: "Settlement not found" });
      }

      const payload = {
        settlementId: existSettlement._id,
        groupId: existSettlement.groupId || roomId, 
        payer: {
          userId: existSettlement.payer.userId,
          username: existSettlement.payer.username,
        },
        receiver: {
          userId: existSettlement.receiver.userId,
          username: existSettlement.receiver.username,
        },
        amount: existSettlement.amount,
        createdBy: existSettlement.createdBy,
        createdAt: existSettlement.createdAt,
      };

     
      io.in(roomId).emit('settlementCreated', payload);

      console.log("Settlement emitted to room:", roomId, payload);

    } catch (error) {
      console.error("Settlement error:", error);
      socket.emit('SettlementError', { message: "Settlement can't be loaded" });
    }
  });
};
