const mongoose = require('mongoose');

const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://sabhrwalkanika1999_db_user:6CxTCm6YmJX5NCvK@cluster0.dhcnhey.mongodb.net/devTinderDB");
}

module.exports = connectDB


