const express = require("express");

const app = express();

app.use("/test",(req,res)=>{
    res.send("Hi");
});

app.listen(3000, ()=>{
    console.log("server success");
});