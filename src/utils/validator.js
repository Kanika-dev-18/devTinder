const validator = require('validator');

const signUpValidator = (req)=>{
 const {firstName, lastName, emailId, password} = req.body || {};

 if(!firstName || !lastName || !emailId || !password){
    throw new Error("First name, last name, email, and password are required");
 }
 if(!validator.isEmail(emailId)){
    throw new Error("Enter a valid email address");
 }
 if(!validator.isStrongPassword(password)){
    throw new Error("Enter a stronger password");
 }

}

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};


module.exports = {signUpValidator,   validateEditProfileData,}