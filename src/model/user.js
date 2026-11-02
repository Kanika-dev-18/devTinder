const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50,
        validate: {
      // Allows only letters/numbers with specific options if needed
      validator: (v) => validator.isAlphanumeric(v, 'en-US', { ignore: '_' }),
      message: 'Username can only contain alphanumeric characters and underscores.'
    }
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50,
       validate: {
      // Allows only letters/numbers with specific options if needed
      validator: (v) => validator.isAlphanumeric(v, 'en-US', { ignore: '_' }),
      message: 'Username can only contain alphanumeric characters and underscores.'
    }
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        validate: {
            validator: (v) => validator.isEmail(v), // Uses validator.js function
            message: 'Invalid email format provided.'
    }
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    gender: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        enum: ['male', 'female', 'other']
    },
});

const UserModel = mongoose.model("user", userSchema);

module.exports  = UserModel;