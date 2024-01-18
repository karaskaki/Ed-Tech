const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// createCourse ka handler function
exports.createCourse = async (req, res) => {

     try{
          
          // fetch data
          const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

          // get thumbnail
          const thumbnail = req.file.thumbnailImage;
     
          // validation
          if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
               return res.status(400).json({
                    success: true,
                    message: "All fields are required",
               })
          }
     
          // check for instructor
          const userId = req.User.id;
          const instructorDetails = await User.findById(userId);
          console.log("Instructor Details: ", instructorDetails);
          // TODO: Verify that userId and instructorDetails.id are same or different ?
     
          if(!instructorDetails) {
               return res.status(404).json({
                    success: false,
                    message: "Instructor Details not found",
               });
          }
     
          // Check wheather given tag is valid or not 
          const tagDetails = await Category.findById(tag);
          if(!tagDetails) {
               return res.status(404).json({
                    success: false,
                    message: "Tag details not found",
               })
          }
     
          // upload image to Cloudinary
          const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
     
          // create an entry for new course
          const newCourse = await Course.create({
               courseName,
               courseDescription,
               instructor: instructorDetails._id,
               whatYouWillLearn: whatYouWillLearn,
               price,
               tag: tagDetails._id,
               thumbnail: thumbnailImage.secure_url,
          });
     
          // add the new course to the user schema of Instructor
          await User.findByIdAndUpdate(
               {_id: instructorDetails._id},
               {
                    $push: {
                         Course: newCourse._id,
                    }
               },
               {new: true},
          )
     

          // Update the Tag ka schema H.W
          tagDetails.courseName = courseName,
          tagDetails.courseDescription = courseDescription,
          tagDetails.whatYouWillLearn = whatYouWillLearn,
          tagDetails.price = price,
          tagDetails.tag = tag
          await tagDetails.save();
     

          // return response
          return res.status(200).json({
               success: true,
               message: "Course created Successfully",
               data: newCourse,
          });
     }

     catch(error){
          console.log(error);
          return res.status(500).json({
               success: false,
               Message: "Failed to create Course",
               error: error.message,
          })
     }
          
}

// getAllCourses handler function
exports.showAllCourses = async (req, res) => {

     try {

          const allCourses = await Course.find({}, {
                                                  courseName: true,
                                                  price: true, 
                                                  thumbnail: true, 
                                                  instructor: true, 
                                                  ratingAndReviews: true, 
                                                  studentsEnrooled: true,})
                                                  .populate("instructor")
                                                  .exec();
          return res.status(200).json({
               success: true,
               message: "Data for all Courses fetched successfully",
               data: allCourses,
          })
     }

     catch(error){
          return res.status(500).json({
               success: false,
               message: "Cannot fetch Course Data",
               error: error.message,
          })
     }
}

// get Course details