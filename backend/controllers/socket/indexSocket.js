const joinGroupSocket = require('../../controllers/socket/joinGroupSocket')
const expenseSocket = require('../../controllers/socket/expenseSocket')
const settlementSocket = require('../../controllers/socket/settlementSocket')
const messageSocket = require('./messageSocket')
const jwt = require('jsonwebtoken') // ✅ Make sure this line is present

module.exports = (io) => {
    // This is middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        console.log("🔐 Authentication attempt with token:", token ? "Present" : "Missing");
        
        if (!token) {
            console.error("❌ No token provided in handshake");
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_PASS);
            socket.userId = decoded.id;
            console.log(`✅ User ${socket.userId} authenticated successfully`);
            next();
        } catch (err) {
            console.error("❌ Token verification failed:", err.message);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🟢 New user connected: ${socket.id}, User ID: ${socket.userId}`);

        joinGroupSocket(io, socket);
        expenseSocket(io, socket);
        settlementSocket(io, socket);
        messageSocket(io, socket);

        socket.on('disconnect', (reason) => {
            console.log(`🔴 User ${socket.userId} disconnected. Reason: ${reason}`);
        });

        socket.on('error', (error) => {
            console.error(`❌ Socket error for ${socket.id}:`, error);
        });
    });
};