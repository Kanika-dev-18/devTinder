require("dotenv").config();

const express = require("express");
const connectDB = require('./config/database');
const app = express();
const http = require("http");

const cors = require('cors');
const cookieParser = require('cookie-parser'); 

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

app.use("/", express.json());
app.use(cookieParser());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database connection failed:", err);
        res.status(503).json({ message: "Database connection unavailable" });
    }
});

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
app.set("io", initializeSocket(server));

if (require.main === module) {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

module.exports = app;
