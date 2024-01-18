const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {

     try {

          // get data
          const {dateOfBirth="", about="", contactNumber, gender} = req.body;

          // get UserId
          const id = req.user.id;

          // validation
          if(!contactNumber || !gender || !id) {
               return res.status(400).json({
                    success: false,
                    message: "Please fill all the fields",
               });
          }

          // find Profile
          const userDetails = await User.findById(id);
          const profileId = userDetails.additionalDetail;
          const profileDetails = await Profile.findById(profileId);

          // update Profile
          profileDetails.dateOfBirth = dateOfBirth,
          profileDetails.about = about,
          profileDetails.contactNumber = contactNumber,
          profileDetails.gender = gender
          await profileDetails.save();

          // send response
          return res.status(200).json({
               success: true,
               message: "Profile Updated Successfully",
               profileDetails,
          });

     }
     catch(error) {
          return res.status(500).json({
               success: false,
               error: error.message,
          })
     }
}



// delete Account
// Explore -> how can we schedule this deletion operation
exports.deleteAccount = async (req,res) => {

     // HW: give otp verification for delete the account through email (suggestion from dipesh)
     try {

          // get Id
          const id = req.user.id;

          // validation
          const userDetails = await User.findById(id);
          if(!userDetails) {
               return res.status(404).json({
                    success: false,
                    message: "User not found",
               })
          }

          // delete profile
          await profile.findByIdAndDelete({_id: userDetails.additionalDetail});
          // HW: unEnroll user from all other courses

          // delete user
          await User.findByIdAndDelete({_id: id});

          // return response
          return res.status(200).json({
               success: true,
               message: "User deleted successfully",
          })
     }
     catch(error) {
          return res.status(500).json({
               success: false,
               message: "User can not deleted successfully",
          })
     }
}