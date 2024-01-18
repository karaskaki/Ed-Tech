const Category = require("../models/Category");

exports.createCategory = async (req,res) => {

     try {
          // Fetch Data
          const {name, description} = req.body;

          // Validation
          if(!name || !description) {
               return res.status(400).json({
                    success: false,
                    message: "All fields are required",
               });
          }

          // create entry in DB
          const tagDetails = await  Category.create({
               name: name,
               description: description,
          });
          console.log(tagDetails);

          // return response
          return res.status(200).json({
               success: true,
               message: "Tags created successfully",
          })
     }
     catch(error) {
          return res.status(500).json({
               success: false,
               message: error.message,
          })
     }
};

// get All Tags
exports.showAllCategory = async (req,res) => {

     try {
          // Find the name and description
          const allTags = await Category.find({}, {name: true, description: true});
          res.status(200).json({
               success: true,
               message: "All Tags returned successfully",
               allTags,
          })

     }
     catch(error) {
          return res.status(500).json({
               success: false,
               message: error.message,
          })
     }
}