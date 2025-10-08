💸 SplitEx — Smart Expense Splitter

SplitEx is a full-stack MERN application that helps users easily split expenses, track balances, and settle payments in real time.
It includes user authentication, group management, live notifications, and Stripe-based payment integration for quick settlements.

🚀 Features
👥 User Authentication – Signup & Login with JWT and bcrypt for security.
💰 Expense Splitting – Create groups, add expenses, and split automatically among members.
⚡ Real-Time Updates – Instant balance updates using Socket.io.
💳 Stripe Payments – Settle balances securely using Stripe Checkout.
📧 Email Notifications – Get notified via email when balances are updated.
🧾 Activity Logs – Track who paid, when, and for what.
🖥️ Responsive Frontend – Clean and modern UI built with React.
🌐 API-based Architecture – RESTful backend with secure endpoints.
🧠 Technologies Used
Frontend
React.js
Axios
Socket.io-client
React Router
CSS / Bootstrap (optional)
Backend
Node.js
Express.js
MongoDB + Mongoose
Socket.io
Stripe API
Nodemailer
JWT (jsonwebtoken)
Bcrypt / BcryptJS
Morgan (logging)
CORS
Dotenv
Validator
📁 Project Structure
SplitEx/
│
├── frontend/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/               # Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env (ignored)
│
├── .gitignore
└── README.md

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/Abdullahsaif77/SplitEx.git
cd SplitEx

2️⃣ Setup the backend
cd backend
npm install


Create a .env file inside backend/ and add your configuration:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_test_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_password
PORT=5000


Then run:

npm start

3️⃣ Setup the frontend
cd ../frontend
npm install
npm start


The app will now run locally:

Frontend → http://localhost:5173
Backend → http://localhost:5500
