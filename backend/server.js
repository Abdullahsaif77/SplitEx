const express = require('express');
require('dotenv').config();
const http = require('http');
const connectDB = require("./config/config");
const dbErrorHandling = require("./middlewares/dbErrorHandling");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groupRoute");
const pagesRoutes = require('./routes/pages');
const { Server } = require('socket.io');
const socketController = require('./controllers/socket/indexSocket');
const cors = require("cors");

const port = 5500;
const app = express();
const server = http.createServer(app);

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: port
  });
});

// ✅ Connect database
connectDB();

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.engine.on("connection", (rawSocket) => {
  console.log("Raw socket connection attempt");
  const clientInfo = {
    remoteAddress: rawSocket._socket?.remoteAddress || 'Unknown',
    remotePort: rawSocket._socket?.remotePort || 'Unknown'
  };
  console.log("📡 Client info:", clientInfo);
});

socketController(io);

// ✅ Routes
app.use('/', authRoutes);
app.use('/', pagesRoutes);
app.use('/', groupRoutes);

// If you have a generic webhook route, use it instead of Stripe


// ✅ Error handling middleware
app.use(dbErrorHandling);

// ✅ Start server
server.listen(port, () => {
  console.log("🚀 Server is running on port", port);
  console.log("✅ Health check available at: http://localhost:5500/health");
});
