const express = require('express')
require('dotenv').config()
const http = require('http')
const connectDB = require("./config/config")
const dbErrorHandling = require("./middlewares/dbErrorHandling")
const authRoutes = require("./routes/auth")
const groupRoutes = require("./routes/groupRoute")
const pagesRoutes = require('./routes/pages')
const { Server } = require('socket.io')
const socketController = require('./controllers/socket/indexSocket')
const cors = require("cors")
const bodyParser = require("body-parser")
const Stripe = require("stripe")
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const port = 5500
const app = express()
const server = http.createServer(app)

// ✅ Webhook FIRST — must come before express.json()
app.post(
  "/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"]
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // will be Buffer now
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    console.log("🎉 Event received:", event.type)
    res.json({ received: true })
  }
)

// ✅ Now parse JSON for all other routes
app.use(express.json())

connectDB()

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}))

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

socketController(io)
const stripeRouter = require("./routes/stripe")(io)

app.use('/', authRoutes)
app.use('/', pagesRoutes)
app.use('/', groupRoutes)
app.use('/stripe', stripeRouter)

app.use(dbErrorHandling)

server.listen(port, () => {
  console.log("Server is running on port", port)
})
