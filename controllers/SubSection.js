const SubSection = require("../models/SubSection")
const Section = require("../models/SubSection")
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config;

// Create a new SubSection
exports.createSubSection = async (req, res) => {
     try{
          // fetch data from req body
          const {SectionId, title, tileDuration, description} = req.body;

          // extract file/video
          const video = req.files.videoFile;

          // validate
          if(!SectionId || !title || !description|| !tileDuration|| !video) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
          }

          // upload video to cloudinary
          const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

          // create new SubSection
          const subSectionDetails = await SubSection.create({
               title: title,
               description: description,
               timeDuration: timeDuration,
               videosUrl: uploadDetails.secure_url,
          })

          // update section with this subsection objectId
          const updatedSection = await Section.findByIdAndUpdate(
                                               {_id: SectionId},
                                               {$push: {SubSection: subSectionDetails._id}},
                                               {new: true});
          // HW: log updated section here , after adding populate query

          // return response
          return res.status(200).json({
               success: true,
               message: "SubSection created successfully",
               updatedSection,
          });
     }
     catch(error){
          return res.status(500).json({
               success: false,
               message: "Internal Server Error",
               error: error.message,
          })
     }
}

// HW: update section

// HW: delete section