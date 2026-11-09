const express = require('express');
const authRouter = express.Router();
const UserModel = require('../model/user');
const {signUpValidator} = require('../utils/validator');
const bcrypt = require('bcrypt');

authRouter.post("/signup", async(req,res) => {
    try{
        console.log("POST /signup received");
        signUpValidator(req);

        const { firstName, lastName, emailId, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new UserModel({
            firstName,
            lastName,
            emailId,
            password : passwordHash
        });

        const savedUser = await user.save();
    
        const token = await savedUser.getJWT();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000)
        });
        const userData = savedUser.toObject();
        delete userData.password;
        res.status(201).json({ data: userData });
        
    }catch(err){
        console.error("Signup failed:", err);
        res.status(400).send("Error in signing up: " + err.message);
    }
});

authRouter.post("/login", async(req,res)=>{
    try{
        const {emailId, password} = req.body;

        const user = await UserModel.findOne({emailId: emailId});
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = user.validatePassword(password);

        if(isPasswordValid){
            const token = await user.getJWT();
            res.cookie("token", token,  {
        expires: new Date(Date.now() + 8 * 3600000),
      });
        res.send(user);
        }else {
      throw new Error("Invalid credentials");
    }
    }catch(err){
          res.status(400).send("ERROR : " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!");
});


module.exports = authRouter;