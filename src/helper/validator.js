const validator = require('validator');

const signUpValidator = (req)=>{
 const {firstName, lastName,emailId, age, gender} = req.body;

 if(!firstName || !lastName){
    throw new error("enter first and last name");
 }else if(!validator.isEmail(emailId)){
    throw new error("enter valid email ID");
 }

}

module.exports = {signUpValidator}