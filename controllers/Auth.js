const User = require("../models/User");
const OTP = require("../models/OTPVerify");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Send OTP
exports.sendOTP = async (req, res) => {

     try {

          // fetch email from request ki body
          const {email} = req.body;

          // check if user already exist
          const checkUserPresent = await User.findOne({email});

          // If user already exist , then return a response
          if(checkUserPresent) {
               res.status(401).json({
                    success: false,
                    message: "User already registered",
               })
          }

          // Generate Otp
          var otp = otpGenerator.generator(6, {
               upperCaseAlphabets: false,
               upperCaseAlphabets: false,
               specialChar: false,
          });
          console.log("OTP generated: ", otp);

          // Check unique OTP or not
          const result = await OTP.findOne({otp: otp});

          while(result){
               otp = otpGenerator.generator(6, {
                    upperCaseAlphabets: false,
                    upperCaseAlphabets: false,
                    specialChar: false,
               });
               result = await OTP.findOne({otp: otp});
          }

          const otpPayload = {email, otp};

          // Create an entry in DB for Otp
          const otpBody = await OTP.create(otpPayload);
          console.log(otpBody);

          // return response successfully
          res.status(200).json({
               success: true,
               message: "OTP send successfully",
               otp,
          })
     }
     catch(error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               message: error.message,
          })
     }
}

// SignUp
exports.signup = async (req,res) => {

     try {
          // Data fetch from req ki body
          const {
               firstName, 
               lastName,
               email, 
               password, 
               confirmPassword,
               accountType,
               contactNumber,
               otp
          } = req.body;

          // valdate karlo
          if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
               return res.status(403).json({
                    success: false,
                    message: "All fields are required",
               })
          }

          // 2 password match karlo
          if(password !== confirmPassword){
               res.status(400).json({
                    success: false,
                    message: "Password And Confirm Password does not match, please try again",
               })
          }

          // check user already exist or not
          const existingUser = await User.findOne({email});
          if(existingUser){
               return res.status(400).json({
                    success: false,
                    message: "User already registered",
               })
          }

          // find the most recent OTP stored in Db for user 
          // HW -> search about sort part 
          const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
          console.log(recentOtp);

          // validate OTP
          if(recentOtp.length == 0) {
               // Otp not found
               return res.status(401).json({
                    success: false,
                    message: "OTP not found",
               })
          }else if(otp !== recentOtp){
               // Invalid Otp
               return res.status(400).json({
                    success: false,
                    message: "OTP's are not matching",
               })
          }

          // hash password 
          const hashedPassword = await bcrypt.hash(password, 10);

          // entry created in DB
          // saving the user entry
          const profileDetails = await  Profile.create({
               gender: null,
               dateOfBirth: null,
               about: null,
               contactNumber: null,
          });

          const user = await User.create({
               firstName,
               lastName,
               email,
               contactNumber,
               password: hashedPassword,
               accountType,
               additionalDetail: profileDetails._id,
               image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
          })

          // return ans
          return res.status(200).json({
               success: true,
               message: "User is registered Successfully",
               user,
          })
     }
     catch(error){  
          console.log(error);
          return res.status(500).json({
               success: false,
               message: "User cannot be registered , please try again",
          })
     }
}

// Login
exports.login = async (req, res) => {

     try {
          // get data from req ki body
          const {email, password} = req.body;

          // valifation data
          if(!email || !password) {
               return res.status(403).json({
                    success: false,
                    message: "All fields are required, please try again later",
               });
          }

          // check karo ki user exist karta hai ki nahi
          const user = await User.findOne({email}).populate("additionalDelails");
          if(!user) {
               return res.status(401).json({
                    success: false,
                    message: "User is not registered, please signup first",
               });
          }

          // Generate JWT, after matching password
          if(await bcrypt.compare(password, user.password)) {
               const payload = {
                    email: user.email,
                    id: user._id,
                    accountType: user.accountType,
               }
               const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: "2h",
               });
               user.token = token;
               user.password = undefined;

               // create cookie and send response
               const options = {
                    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // it represents 3 Days
                    httpOnly: true,
               }

               res.cookie("token", token, options).status(200).json({
                    success: true,
                    token, 
                    user,     
                    message: "Logged In Successfully",
               })
          }
          else {
               return res.status(401).json({
                    success: false,
                    message: "Password is incorrect",
               });
          }
     }
     catch(error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               message: "login Failure, please try again",
          });
     }
}

// Change Password
exports.changePassword = async (req, res) => {
     
     try {
          // get data from req.body
          const user = await User.findOne(req.user.email);

          // get oldPaaword, newPassword, ConfirmNewPassword
          const { oldPassword, newPassword, confirmNewPassword } = req.body;

          // Check if the provided old password matches the current password
          const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
          if (!isPasswordMatch) {
               return res.status(401).json({
                    success: false,
                    message: "Old password is incorrect",
               });
          }

          // Validation
          if (!oldPassword || !newPassword || !confirmNewPassword) {
               return res.status(403).json({
                    success: false,
                    message: "All fields are required",
               });
          }

          // Check if the new password and confirmNewPassword match
          if (newPassword !== confirmNewPassword) {
               return res.status(400).json({
                    success: false,
                    message: "New password and Confirm new password do not match",
               });
          }

          // Check that oldPassowrd and newPassword should not match
          if(oldPassword === newPassword) {
               return res.status(401).json({
                    success: false,
                    message: "NewPassword should not match with OldPassword",
               });
          }

          // Update password
          const encryptedPassword = await bcrypt.hash(newPassword, 10)
          const updatedUserDetails = await User.findByIdAndUpdate(
          req.user.id,
          { password: encryptedPassword },
          { new: true })

          // send mail - Password updated
          try {
               const emailResponse = await mailSender(
                    updatedUserDetails.email,
                    "Password for your account has been updated",
                    `Password updated successfully for userID: ${updatedUserDetails.email}`     
               )
               console.log("Email sent successfully:", emailResponse.response);
          }
          catch(error) {
               console.error("Error occurred while sending email:", error);
               return res.status(500).json({
                    success: false,
                    message: "Error occured while sending the email",
                    error: error.message,
               })
          }

          // Return successful response
          return res.status(200).json({
               success: true,
               message: "Password changed successfully",
          });
     }
     catch (error) {
          console.log("Error occurred while Changing password", error);
          return res.status(500).json({
               success: false,
               message: "Error occurred while Changing password",
          })
        }
}