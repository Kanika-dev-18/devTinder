const express = require("express");

const app = express();
const connectDB = require('./config/database');
const UserModel = require('./model/user');
const {signUpValidator} = require('./helper/validator');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use("/", express.json());
app.use(cookieParser);


app.post("/signup", async(req,res)=>{

    const {firstName, lastName, emailId, password} = req.body;

    //validation of data
        signUpValidator(req);
    //encryption of password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new UserModel({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
    });
    try{
        await user.save();
        res.send("user added successfully");

    }catch(err){
        res.status(400).send("error in saving : ", err.message);
        console.log(err.message);
    }
});

app.post("/login", async(req,res)=>{
    try{
        const {emailId, password} = req.body;
          const user = await UserModel.find({emailId : emailId});
          if(!user){
            throw new Error("Invalid Credentials");
          }
          const isPasswordMatched = await bcrypt.compare(password, user.password);
          if(isPasswordMatched){
            res.send("login success");
            
            //cookie
            const token = await jwt.sign({_id: user._id}, "Dev@Tinder@kanika");

            res.cookie("token", token);
          }else{
              throw new Error("Invalid Credentials");
          }
    }catch(err){
        res.status(400).send("error");
    }
});

app.get("/profile", async(req,res)=>{
    const cookies = req.cookies;
    

})

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
