require("dotenv").config();

const express = require("express");
const connectDB = require('./config/database');
const app = express();

const cors = require('cors');
const cookieParser = require('cookie-parser'); 

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
app.use("/", express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);


connectDB().then(()=>{
    console.log("connect success");
    app.listen(3000, ()=>{
    console.log("server success");
});
}).catch((err)=>{
    console.log("error: ", err);
});
