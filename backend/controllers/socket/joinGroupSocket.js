const Group = require('../../models/group')

module.exports = (io,socket)=>{
    socket.on('JoinGroup',async({roomId , roomName})=>{
        try{
            const existGroup = await Group.findById(roomId);
            if(!existGroup){
                return socket.emit('error',{message:"Group does not exist"})
            }

         if (!existGroup.members.some(m => m.userId.toString() === socket.userId)) {
            return socket.emit("error", { message: "Not a member of this group" });
        }
  
              

            socket.join(roomId);

            socket.emit("Joined group",{
                status:"Successfull",
                roomId,
                roomName:existGroup.name,
                userId:socket.userId
            })

            socket.to(roomId).emit('userJoined',{
                roomId,
                userId: socket.userId,
                message: `User ${socket.userId} joined the group`
            })
            console.log(`User ${socket.userId} joined group ${roomId}`);
        }
        catch(error){
            socket.emit("error", { message: "Failed to join group" });
        }
    })

    socket.on('leaveGroup',async({roomId,roomName})=>{
        try{
            const existGroup = await Group.findById(roomId);
            if(!existGroup){
                return socket.emit('error',{message:"Group does not exist"})
            }

         if (!existGroup.members.some(m => m.userId.toString() === socket.userId)) {
            return socket.emit("error", { message: "Not a member of this group" });
        }

            socket.leave(roomId);

            socket.emit("leftGroup",{
                status:"Successfull",
                roomId,
                roomName:existGroup.name,
                userId:socket.userId
            })

            socket.to(roomId).emit('userLeft',{
                roomId,
                userId: socket.userId,
                message: `User ${socket.userId} left the group`
            })

            console.log(`User ${socket.userId} left the group`)

        }
        catch(error){
            socket.emit('error',{message:"Failed to left"});
        }
    })
}