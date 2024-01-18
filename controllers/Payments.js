const {instance} = require("../config/razerpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {default: mongoose} = require("mongoose");


// capture the payment and inisciate the razerpay order
exports.capturePayment = async (req, res) => {

     // get course Id and User Id
     const {course_id} = req.body
     const userId = req.user.id

     // validation
     // valid course Id 
     if(!course_id) {
          return res.json({
               success: false,
               message: "Please provide valid course ID",
          })
     }

     // valid course details
     let course;
     try {
          course = await Course.findById(course_id);
          if(!course) {
               return res.json({
                    success: false,
                    message: "Could not find the course",
               })
          }

          // user already pay for the same course
          // change the user id from string to object
          const uid = new mongoose.Types.ObjectId(userId);
          if(course.studentsEnrooled.include(uid)) {
               return res.status(200).json({
                    success: false,
                    message: "Student has already enrolled",
               });
          }
     }
     catch(error) {
          console.log(error);
          return res.json({
               success: false,
               message: error.message,
          });
     }

     
     // create order
     const amount = course.price;
     const currency = "INR";

     const options = {
          amount: amount * 100,
          currency,
          receipt: Math.random(Date.now()).toString(),    // additional data
          notes: {                                        // additional data
               courseId: course_id,
               userId, 
          }
     };

     try {
          // initiate the payment using razorpay
          const paymentResponse = await instance.orders.create(options);
          console.log(paymentResponse);
          return res.status(200).json({
               success: true,
               courseName: course.courseName,
               courseDescription: course.courseDescription,
               thumbnail: course.thumbnail,
               orderId: paymentResponse.id,
               currency: paymentResponse.currency,
               amount: paymentResponse.amount,
          })
     }
     catch(error) {
          console.log(error);
          res.json({
               success: false,
               message: "Could not initiate order", 
          })
     }

     // return response
}

// Verify Signature
exports.verifySignature = async (req, res) => {
      
     const webHookSecret = "12345678"; // it is our secret key

     const signature = req.headers["x-razorpay-signature"];  // it is send by razorpay 

     // Hmac -> hashed based message authentication code which takes an hashing algo and secret key
     const shasum = crypto.createHmac("sha256", webHookSecret);
     shasum.update(JSON.stringify(req.body)); // convert it into string 
     const digest = shasum.digest("hex");

     if(signature === digest) {
          console.log("Payment is Authorised");

          const {courseId, userId} = req.body.payload.payment.entity.notes;

          try {
               // fulfil the action
               // find the course and enroll the student in it
               const enrolledCourse = await Course.findOneAndUpdate(
                                             {_id: courseId},
                                             {$push: {studentsEnrooled: userId}},
                                             {new: true},        
               )

               if(!enrolledCourse) {
                    return res.status(500).json({
                         success: false,
                         message: "Course not found",
                    });
               }

               console.log(enrolledCourse);

               // find the student and add the course in their list of enrolled Courses
               const enrolledStudent = await User.findOneAndUpdate(
                                             {_id: userId},
                                             {$push: {courses: courseId}},
                                             {new: true},
               )

               console.log(enrolledCourse);

               // send confirmation mail
               const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratulations from team CodeHelp",
                                        "Congratulations, you are onboarded into a new Codehelp cousrse",
               )

               console.log(emailResponse);

               return res.status(200).json({
                    success: true,
                    message: "Signature verified and Course Added",
               });
          }

          catch(error) {
               console.log(error);
               return res.status(500).json({
                    success: false,
                    message: error.message,
               });
          }
     } else {
          return res.status(400).json({
               success: false,
               message: "Invalid Request",
          })
     }



      
}    