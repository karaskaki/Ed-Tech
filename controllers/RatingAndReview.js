const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { isStudent } = require("../middleware/auth");


// Create Rating and review
exports.createRating = async (req, res) => {

     try{

          // get userId
          const userId = req.user.id;

          // fetch data from req's body
          const {rating, review, CourseId} = req.body;

          // check if user is enrolled or not
          const courseDetails = await Course.findOne(
                                             {_id: CourseId,
                                             studentsEnrolled: {$elemMatch: {$eq: userId}},
                                        });  

          if(!courseDetails) {
               return res.status(404).json({
                    success: false,
                    message: "Student is not enrolled in the course",
               });
          }

          // check if user already reviewd the course
          const alreadyReviewed = await RatingAndReview.findOne({
                                                       user: userId,
                                                       course: CourseId,
                                                  });

          if(alreadyReviewed) {
               return res.status(403).json({
                    success: false,
                    message: "Course is already reviewed by the user",
               });
          }

          // create rating and review
          const ratingReview = await RatingAndReview.create({
                                                  rating, review,
                                                  course: CourseId,
                                                  user: userId,
          })

          // update the course with the rating and review
          const UpdatedCourseDetails = await Course.findByIdAndUpdate({_id: CourseId}, 
                                        {
                                             $push: {
                                                  ratingAndReviews:  ratingReview._id,
                                             }
                                        },{new: true})

          console.log(UpdatedCourseDetails);

          // return response
          return res.status(200).json({
               success: true,
               message: "Rating and Review Created successfully",
          });

     } catch(error) {
          return res.status(500).json({
               success: false,
               message: error.message,
          })
     }
}

// get Average rating and review
exports.getAverageRating = async (req, res) => {

     try{ 
          // get courseId
          const courseId = req.body.courseId;

          // Calculate the average rating
          const result = RatingAndReview.aggregate([
               {
                    $match: {
                         course: mongoose.Types.ObjectId(courseId),
                    },
               },
               {
                    $group: {
                         _id: null,
                         averageRating: {$avg: "$rating"},
                    }
               }
          ])

          // return rating
          if(result.length > 0) {
               return res.status(200).json({
                    success: true,
                    averageRating: result[0].averageRating,
               })
          }

          // if no rating/review exist
          return res.status(200).json({
               success: true,
               message: "Average Rating is 0, no rating given till now",
               averageRating: 0,
          })

     } catch(error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               message: error.message,
          });
     }
}

// get all rating and review
exports.getAllRating = async (req, res) => {

     try{
          const allReviews = await RatingAndReview.find({})
                                   .sort({rating: "desc"})
                                   .populate({
                                        path: "user",
                                        select: "firstName lastName email image",
                                   })
                                   .populate({
                                        path: "course",
                                        select: "courseName",
                                   })
                                   .exec();
     return res.status(200).json({
          success: true,
          message: "All reviews fetched successfully",
          data: allReviews,
     })

     } catch(error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               message: error.message,
          })
     }
}