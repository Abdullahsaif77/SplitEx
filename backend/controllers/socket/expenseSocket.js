const Expense = require('../../models/expense');
const Group = require('../../models/group');

module.exports = (io, socket) => {
  socket.on('expenseCreated', async ({ expenseId, roomId }) => {

    try {

      const existExpense = await Expense.findById(expenseId)
        .populate("payer", "name")
        .populate("createdBy", "name");

      if (!existExpense) {
        return socket.emit('error', { message: "This expense is not found in database" });
      }

      const payload = {
        expense: {
          id: existExpense._id,
          description: existExpense.description,
          totalAmount: existExpense.amount,
          currency: existExpense.currency,
          payer: {
            id: existExpense.payer._id,
            name: existExpense.payer.name,
          },
          createdBy: {
            id: existExpense.createdBy._id,
            name: existExpense.createdBy.name,
          },
          groupId: existExpense.groupId,
          split: {
            method: existExpense.split.method,
            details: existExpense.split.details.map(d => ({
              userId: d.userId,
              amount: d.amount,
            })),
          },
          participants: existExpense.participants.map(p => ({
            userId: p.userId,
            share: p.share,
            paid: p.paid,
          })),
          createdAt: existExpense.createdAt,
        },
      };
     
      io.in(roomId).emit("Expense", payload);

      console.log("Expense emitted to room:", roomId, payload.expense.id);

    } catch (error) {
      console.error(error);
      socket.emit('error', { message: "Expense can't be loaded" });
    }
  });
};
