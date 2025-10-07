const joinGroupSocket = require('../../controllers/socket/joinGroupSocket')
const expenseSocket = require('../../controllers/socket/expenseSocket')
const settlementSocket = require('../../controllers/socket/settlementSocket')
const messageSocket = require('./messageSocket')
const jwt = require('jsonwebtoken')


module.exports = (io)=>{

    //This is middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }
    
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET_PASS);
          socket.userId = decoded.id; 
          next();
        } catch (err) {
          next(new Error("Authentication error: Invalid token"));
        }
      });


    io.on('connection',(socket)=>{
        console.log('A new user is connected',socket.id);

        joinGroupSocket(io,socket);
        expenseSocket(io,socket);
        settlementSocket(io,socket)
        messageSocket(io,socket);

        socket.on('disconnect', (reason) => {
          console.log(`User ${socket.userId} disconnected. Reason: ${reason}`);
        });        
    })
}