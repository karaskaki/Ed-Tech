const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Auth
exports.auth = async (req, res, next) => {
     
     try {
          // extract token
          const token = req.cookies.token 
                         || req.body.token 
                         || req.header("Authorization").replace("Bearer ", "");

          // if token missing, send response
          if(!token || token == undefined) {
               return res.status(401).json({
                    success: false,
                    message: "Token Missing",
               });
          }

          try {
               // verify the token
               const decode = jwt.verify(token, process.env.JWT_SECRET);
               console.log(decode);
               req.user = decode;
          }         
          catch(error) {
               // if there any issue in verification
               return res.status(401).json({
                    success: false,
                    message: "token is invalid",
               });
          }
          next()
     }
     catch(error) {
          return res.status(401).json({
               success: false,
               message: "Something went wrong while validating the token",
          })
     }
}

// isStudent
exports.isStudent = async (req, res, next) => {
     try{
          if(req.user.accountType !== "Student") {
              return res.status(401).json({
                  success:false,
                  message:'This is a protected route for students only',
              });
          }
          next();
  } 
  catch(error) {
      return res.status(500).json({
          success:false,
          message:'User Role cannot be verified, please try again',
      })
  }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
     try{
          if(req.user.accountType !== "Instructor") {
              return res.status(401).json({
                  success:false,
                  message:'This is a protected route for Instructor only',
              });
          }
          next();
  } 
  catch(error) {
      return res.status(500).json({
          success:false,
          message:'User Role cannot be verified, please try again',
      })
  }
}

// isAdmin
exports.isAdmin = async (req, res, next) => {
     try{
          if(req.user.accountType !== "Admin") {
              return res.status(401).json({
                  success:false,
                  message:'This is a protected route for Admin only',
              });
          }
          next();
  } 
  catch(error) {
      return res.status(500).json({
          success:false,
          message:'User Role cannot be verified, please try again',
      })
  }
}