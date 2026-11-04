const validator = require('validator');

const signUpValidator = (req)=>{
 const {firstName, lastName,emailId, age, gender} = req.body;

 if(!firstName || !lastName){
    throw new Error("enter first and last name");
 }else if(!validator.isEmail(emailId)){
    throw new Error("enter valid email ID");
 }

}

module.exports = {signUpValidator}