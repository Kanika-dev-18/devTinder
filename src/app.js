const express = require("express");

const app = express();
const connectDB = require('./config/database');
const UserModel = require('./model/user');

app.use("/", express.json());


app.post("/signup", async(req,res)=>{
    const user = new UserModel(req.body);
    try{
        await user.save();
        res.send("user added successfully");

    }catch(err){
        res.status(400).send("error in saving : ", err.message);
    }
});

app.get("/feed", async(req,res)=>{
    const userEmail = req.body.emailId;
    try{
        const user = await UserModel.find({emailId : userEmail});
        res.send(user);
        console.log(user);
    }catch(err){
        res.status(404).send("error");
    }
})

app.delete("/delete",async(req,res)=>{
    const userId = req.body._id;
    try{
        const deletedUser = await UserModel.deleteOne({_id: userId});
        console.log(deletedUser);
        res.send("delete success");
    }catch(err){
        res.status(404).send("error while deleting");
    }
})

app.patch("/user/:userId", async(req,res)=>{
    const userId = req.params.userId;
    const data = req.body;
    try{
        //It creates a strict whitelist of fields that a user is legally allowed to modify on their profile
        const ALLOWED_UPDATES = ["firstName", "lastName", "gender", "age"];

        // Object.keys(data) extracts all the property names sent in the request body.
        // The .every() method checks every single key to ensure it exists inside the ALLOWED_UPDATES array.

        const isUpdateAllowed = Object.keys(data).every((k)=> ALLOWED_UPDATES.includes(k));
        if(!isUpdateAllowed){
            throw new Error("Update not allowed");
        }
        const UpdateUser = await UserModel.findByIdAndUpdate(userId, {firstName: "K"});
        console.log(UpdateUser);
        res.send("update success");
    }catch(err){
        res.status(404).send("error while updating");
    }
})


connectDB().then(()=>{
    console.log("connect success");
    app.listen(3000, ()=>{
    console.log("server success");
});
}).catch((err)=>{
    console.log("error: ", err);
});
