const User = require("../models/User");
const mailSender = require("../utils/mailSender");

// ResetPasswordToken
exports.resetPasswordToken = async (req, res) => {

     try {

          // get email from req.body
          const email = req.body.email;

          // check user for this email, email verification
          const user = await User.findOne({email: email});
          if(!user) {
               return res.status(401).json({
                    success: false,
                    message: "Your email is not registered with us",
               })
          }

          // generate token
          const token = crpyto.randomUUID();

          // Upadte user by adding token and expiration time
          const updatedDetails = await User.findOneAndUpdate(
               {email: email},
               {
                    token: token,
                    resetPasswordExpires: Date.now() + 5 * 60 * 1000,
               },
               {new: true});

          // create url
          const url = `http://localhost:3000/update-password/${token}`

          // send mail containing the url
          await mailSender(email,
                         "Password reset link",
                         `Password reset Link: ${url}`);

          // return response
          return res.status(201).json({
               success: true,
               message: "Email sent Successfully, please check email and change password", 
          })
     }
     catch(error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               message: "Something went wrong while sending reset password mail"
          })
     }
}

// Reset Password
