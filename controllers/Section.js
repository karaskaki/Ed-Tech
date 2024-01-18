const Section  = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
     
     try {
          // data fetch
          const {sectionName, courseId} = req.body;

          // validatioin
          if(!sectionName || !courseId) {
               return res.status(400).json({
                    success: false,
                    message: "Missing Properties",
               });
          }

          // create section
          const newSection = await Section.create({sectionName});

          // update course with section object_id
          const updatedCourseDetails = await Course.findByIdAndUpdate(
                                             courseId,
                                             {
                                                  $push: {
                                                       courseContent: newSection._id,
                                                       },
                                                  },
                                             {new: true},
                                             ).populate()
          // Hw: use populate to replace section/subsection both in the updatedCourseDetails

          // return response
          return res.status(201).json({
                   success: true,
                   message: "Section Created Successfully",
                   updatedCourseDetails,
                  });
     }

     catch(error) {
          return res.status(500).json({
               success: false,
               message: "Unable to create Section, please try again",
               error: error.message,
          });
     }
}


// Update Section
exports.updateSection = async (req, res) => {
     try {
          // data input
          const {sectionName, sectionId} = req.body;

          // data validation
          if(!sectionName ||!sectionId) {
               return res.status(400).json({
                    success: false,
                    message: "Missing Properties",
               });
          }

          // update data
          const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});

          // return res
          return res.status(200).json({
                   success: true,
                   message: "Section Updated Successfully",
                  });
     }

     catch(error) {
          return res.status(500).json({
               success: false,
               message: "Unable to update Section, please try again",
               error: error.message,
          });
     }
}

// Delete Section
exports.deleteSection = async (req, res) => {
     try{
          // get Id - assumeing that we are sending ID in Params
          const {sectionId} = req.params

          // use findByIdAndDelete
          await Section.findByIdAndDelete(sectionId);
          // HW: Do we need to delete the entry from course schema ???

          // return res
          return res.status(200).json({
                   success: true,
                   message: "Section Deleted Successfully",
                  });
     }    

     catch(error) {
          return res.status(500).json({
               success: false,
               message: "Unable to delete Section, please try again",
               error: error.message,
          });
     }
}