const jwt = require('jsonwebtoken');
const UserModel = require('../model/user');
const auth = async(req,res,next)=>{
    const {token}= req.cookies;
    const decodeObj = await jwt.verify(token, "asdfghjklsdfghjk");
    const {_id} = decodeObj;
    const user = await UserModel.findById(_id);
    if(!user){
        throw new Error("error");
    }
    next();
}

module.exports = {auth,}