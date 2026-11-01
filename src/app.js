const express = require("express");

const app = express();
const{auth} = require('./middleware/auth');

app.use("/user",auth)
app.get("/user/userData",(req,res,next)=>{
    res.send("user data sent");
});
app.delete("/user/deleteUser", (req,res)=>{
    res.send("DELETED!!!!");
})

// app.use("/user", 
//     ( (req,res,next)=>{
//         console.log("1");
//         // res.send("1");
//         next();
//     }),
//     ( (req,res,next)=>{
//         console.log("2");
//         res.send("2");
//         next();
//     }),
//     ((req,res,next)=>{
//         console.log("3");
//         res.send("3");
//         next();
//     }),
//     ((req,res,next)=>{
//         console.log("4");
//         res.send("4");
//         // next();
//     })
// );

app.listen(3000, ()=>{
    console.log("server success");
});