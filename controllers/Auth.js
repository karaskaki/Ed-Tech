const User = require("../models/User");
const OTP = require("../models/OTPVerify");

console.log("hello");

// Send OTP
exports.sendOTP = async (req, res) => {

     // fetch email from request ki body
     const {email} = req.body;

     // check if user already exist
     const checkUserPresent = await User.findOne({email});

}

// SignUp

// Login

// Change Password