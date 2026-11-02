const express = require("express");

const app = express();
const connectDB = require('./config/database');
const UserModel = require('./model/user');

app.post("/signup", async(req,res)=>{
    const user = new UserModel({
        firstName: "KanikaS",
        lastName: "Sabharwal",
        emailId: "kS@gmail.com",
        password: "124345",
        age: 27,
        gender: "F"

    });
    try{
        await user.save();
        res.send("user added successfully");

    }catch(err){
        res.status(400).send("error in saving : ", err.message);
    }
});


connectDB().then(()=>{
    console.log("connect success");
    app.listen(3000, ()=>{
    console.log("server success");
});
}).catch((err)=>{
    console.log("error: ", err);
});
