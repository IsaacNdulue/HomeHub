const agentModel = require('../Model/agentModel')
const cateModel = require('../Model/CateModel')
const house = require('../Model/houseModel')
const houseModel = require('../Model/houseModel')
const cloudinary = require('../Utility/cloudinary.js')
const jwt = require("jsonwebtoken")



// exports.postHouse = async (req, res) => {
//   try {
//     const { type, location, description, amount, categoryId } = req.body;
    
//     // Extract agent's info from the token
//     const agentToken = req.headers.authorization.split(" ")[1];
//     const decoded = jwt.verify(agentToken, process.env.jwtSecret);
//     const agentId = decoded.agentId;

//     // Finding the agent using the extracted agentId
//     const agent = await agentModel.findById(agentId);
    
//     if (!agent) {
//       return res.status(400).json({ message: 'You are not logged in' });
//     }

//     if (!agent.isVerified) {
//       return res.status(400).json({
//         message: `Can't post. Please verify your account via link sent to ${agent.email}`
//       });
//     }

//     // Fetching the category based on the provided categoryId
//     const category = await cateModel.findById(categoryId);

//     if (!category) {
//       return res.status(400).json({ message: 'Category does not exist' });
//     }

//     // Upload images to Cloudinary
//     const uploadedImages = [];
//     const imageKeys = ['imageA', 'imageB', 'imageC', 'imageD', 'imageE', 'imageF'];

//     for (const key of imageKeys) {
//       if (req.files[key]) {
//         const imageFile = req.files[key][0].path;
//         const imageFileResult = await cloudinary.uploader.upload(imageFile);
//         uploadedImages.push(imageFileResult.secure_url);
//       }
//     }

//     // Create house document
//     const house = await houseModel.create({
//       type,
//       location,
//       amount,
//       description,
//       categoryId,
//       agentId: agent._id,
//       companyName: agent.companyName,
//       ...Object.fromEntries(uploadedImages.map((url, index) => [`image${String.fromCharCode(65 + index)}`, url]))
//     });

//     // Update category and house documents
//     category.house.push(house._id);
//     house.category = categoryId;

//     await Promise.all([category.save(), house.save()]);

//     res.status(201).json({
//       message: 'House posted successfully',
//       data: house
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };


exports.postHouse = async (req, res) => {
  try {
    const { type, location, description, amount, categoryId } = req.body;

    // Extract agent's info from the token
    const agentToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(agentToken, process.env.jwtSecret);
    const agentId = decoded.agentId;

    // Finding the agent using the extracted agentId
    const agent = await agentModel.findById(agentId);

    if (!agent) {
      return res.status(400).json({ message: 'You are not logged in' });
    }

    if (!agent.isVerified) {
      return res.status(400).json({
        message: `Can't post. Please verify your account via link sent to ${agent.email}`
      });
    }

    if (agent.isGood === false) {
      return res.status(400).json({
        message: `Hi, you can't post now, your document is been reviewed wait for 24hours`
      });
    }

    const category = await cateModel.findById(categoryId);

    if (!category) {
      return res.status(400).json({ message: 'Category does not exist' });
    }

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        
        const result = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });
        return result.secure_url;
      })
    );

    if (uploadedImages.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }


    const house = await houseModel.create({
      type,
      location,
      amount,
      description,
      categoryId,
      agentId: agent._id,
      companyName: agent.companyName ,
      images: uploadedImages
    });

    category.house.push(house._id);
    house.category = categoryId;

    await Promise.all([category.save(), house.save()]);

    res.status(201).json({
      message: 'House posted successfully',
      data: house
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
};






const schedule = require('node-schedule');

exports.sponsorPost = async (req, res) => {
  try {
    const houseId = req.params.houseId;
    const token = req.params.token;
    // Get the original house from the database
    const originalHouse = await houseModel.findById(houseId);
    
    if (!originalHouse) {
      return res.status(404).json({
        message: "House not found",
      });
    }
    
    // Update the isSponsored field to true
    const updatedHouse = await houseModel.findByIdAndUpdate(houseId, { isSponsored: true }, { new: true });

    // Schedule to remove sponsorship after a week
    const jobDate = new Date();
    jobDate.setDate(jobDate.getDate() + 7); // Add 7 days to the current date
    const job = schedule.scheduleJob(jobDate, async function() {
      await houseModel.findByIdAndUpdate(houseId, { isSponsored: false });
      console.log(`Sponsored house with ID ${houseId} removed from sponsored after a week.`);
    });
    // const jobDate = new Date();
    // jobDate.setMinutes(jobDate.getMinutes() + 1); // Add 1 minute to the current time
    // const job = schedule.scheduleJob(jobDate, async function() {
    //   await houseModel.findByIdAndUpdate(houseId, { isSponsored: false });
    //   console.log(`Sponsored house with ID ${houseId} removed from sponsored after 1 minute.`);
    // });
    res.status(201).json({
      message: "House sponsored successfully",
      data: updatedHouse, 
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during sponsoring",
      error: error.message
    });
  }
}


// exports.sponsorPost = async(req,res)=>{
//   try {
//     const houseId = req.params.houseId;
//     const token = req.params.token;
//     //get the original house from database
//     const originalHouse = await houseModel.findById(houseId)
 
    
//     if(!originalHouse){
//       return res.status(404).json({
//         message:"House not found",
//       });
//     }
//     const updatedHouse = await houseModel.findByIdAndUpdate(houseId,{isSponsored:true},{new:true})

//     res.status(201).json({
//       message:"House sponsored successfully",
//       data:updatedHouse
//     });
//     setTimeout(async () => {
//       // Delete the post after a week
//       await houseModel.findByIdAndUpdate(houseId,{isSponsored:false});
//       console.log(`Sponsored house with ID ${houseId} removed from sponsored after a week.`);
//     }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

//   }  catch (error) {
//     res.status(500).json({
//       message:"Error during sponsoring",
//       error:error.message
//     })
//   }
// }
// exports.sponsorPost = async(req,res)=>{
//   try {
//     const houseId = req.params.houseId;
//     //get the original house from database
//     const originalHouse = await houseModel.findById(houseId)
//     const agent = await agentModel.find()

//     if(!originalHouse){
//       return res.status(404).json({
//         message:"Original house not found",
//       });
//     }

//     // create a new sponsored post based on the original house details

//     const sponsorPost = new house({
//       type:originalHouse.type,
//       location:originalHouse.location,
//       description:originalHouse.description,
//       amount:originalHouse.amount,
//       isSponsored:true,
//       agentId:originalHouse.agentId,
//       agent:agent.companyName,
//       images:originalHouse.images
      
//     })

//     await sponsorPost.save();

//     res.status(201).json({
//       message:"House shared and sponsored successfully",
//       data:sponsorPost
//     });
//     setTimeout(async () => {
//       // Delete the post after a week
//       await houseModel.findByIdAndDelete(sponsorPost._id);
//       console.log(`Sponsored post with ID ${sponsorPost._id} deleted after a week.`);
//     }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

//   }  catch (error) {
//     res.status(500).json({
//       message:"Error during sponsoring",
//       error:error.message
//     })
//   }
// }

exports.getAgentSponsoredPost = async(req,res)=>{
  try{
    const id = req.params.id
    const agent = await agentModel.findById(id)
    const sponsoredPosts = await houseModel.find({
      agentId:agent,
      isSponsored:true
    }).populate('agentId', 'companyName');

    if(sponsoredPosts.length < 1 ){
      return res.status(403).json({
        mesage:'You have no sponsored post'
      })
    }
    res.status(200).json({
      message:`Sponsored posts for agent is ${sponsoredPosts.length} within last week`,
      data:sponsoredPosts
    })

  }catch(error){
    res.status(500).json({
      message:"Error during retrieving sponsored posts",
      error:error.message
    })
  }
}


exports.allSponsoredPost = async (req, res) => {
  try {
      // Find all posts where isSponsored is true
      const sponsoredPosts = await houseModel.find({ isSponsored: true });

      if (sponsoredPosts.length > 0) {
          return res.status(200).json({
              message: `There are ${sponsoredPosts.length} sponsored posts`,
              data: sponsoredPosts
          });
      } else {
          return res.status(404).json({
              message: 'No sponsored posts found'
          });
      }
  } catch (error) {
      return res.status(500).json({
          error: error.message
      });
  }
}

exports.deleteSponsoredHouse = async(req, res)=>{
  try {
    const sponsoredId = req.params.id
    //Extract agents's info from the token
    const agentToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(agentToken, process.env.jwtSecret);
    const agentId = decoded.agentId
    //finding the agent using the extracted agentId
    const agent = await agentModel.findById(agentId);
    
    if(!agent){
      return res.status(400).json({
        message:'You are not logged in'
      });
    }
    
    const sponsoredToDelete = await houseModel.findOne({
      _id: sponsoredId,
      agentId:agentId,
      isSponsored: true
    })
    if(!sponsoredToDelete){
      return res.status(404).json({
        message: 'Sponsored House not found'
      })
    }

    await houseModel.findByIdAndDelete(sponsoredId)
    res.status(200).json({
      message: 'Sponsored house deleted successfully'
    })
    
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}

exports.getOneHouse = async (req,res)=>{
    try{
      const id = req.params.id
      const house = await houseModel.findById(id).populate({
        path:'category',
        select:'type'
      });
      if (!house){
        return res.status(401).json({
          message: "house not found"
        })
      }
      else{
        return res.status(200).json({
          message: 'house found',
          data:house
        })
      }
  
    }catch(error){
      res.status(500).json({
        message:error.message 
      })
    }  
}

// exports.updateHouse = async (req,res)=>{

//     try{
//       const id = req.params.id
//       const {type,amount,location,desc,Images}= req.body
//       const updatedhouse= await houseModel.findByIdAndUpdate(id,{type,amount,location,desc,Images},{new:true})
    
//       if(!updatedhouse){
//         return res.status(400).json({
//           message:'house not updated',
//         })
//       }
//       else{
//         return res.status(200).json({
//           message: "updated successfully",
//           data:updatedhouse
//         })
//       }
//     }catch(error){
//       res.status(500).json({
//         message: error.message
//       })
//     }
    
//     }



// Multer setup for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });



// Edit House Function
exports.editHouse = async (req, res) => {
  try {
    const houseId = req.params.houseId;
    const agentId = req.agent.agentId;
    const { type, location, description, amount } = req.body;

    // Fetch the house to edit
    const house = await houseModel.findById(houseId);

    // Check if the house exists and the agent is the owner
    if (!house) {
      return res.status(400).json({
        message: "House not found ",
        error: error.message
      });
    }
    if (house.agentId !== agentId) {
      return res.status(400).json({
        message: "You don't have permission to edit",
        error: error.message
      });
    }

    // Update house details
    house.type = type || house.type;
    house.location = location || house.location;
    house.description = description || house.description;
    house.amount = amount || house.amount;

    // Handle image updates
    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.buffer.toString('base64'), { resource_type: 'auto' });
          return result.secure_url;
        })
      );
      house.images = uploadedImages;
    }

    // Save the updated house
    await house.save();

    res.status(200).json({
      message: "House updated successfully",
      data: house,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during updating house",
      error: error.message,
    });
  }
};





// exports.editHouse = async (req, res) => {
//   try {
//     const houseId = req.params.houseId;
//     const {type, amount,location, images, description } = req.body;

//     // Fetch the house from the database
//     const house = await houseModel.findById(houseId);

//     // Check if the house exists
//     if (!house) {
//       return res.status(404).json({
//         message: "House not found",
//       });
//     }

//     // Check if the logged-in agent owns the house
//     if (house.agentId !== req.agent.agentId.toString()) {
//       return res.status(403).json({
//         message: "You are not authorized to edit this house",
//       });
//     }

//     // Update the house details
//     if (images) {
//       // If images are provided, update the images array
//       const uploadedImages = await Promise.all(
//         images.map(async (file) => {
//           const result = await cloudinary.uploader.upload(file.path, {
//             resource_type: "auto",
//           });
//           return result.secure_url;
//         })
//       );
//       house.images = uploadedImages;
//     }

//     if (type) {
//       // If type is provided, update the type
//       house.type = type;
//     }
//     if (description) {
//       // If description is provided, update the description
//       house.description = description;
//     }
//     if (amount) {
//       // If amount is provided, update the amount
//       house.amount = amount;
//     }
//     if (location) {
//       // If location is provided, update the location
//       house.amount = amount;
//     }

//     // Save the updated house details
//     await house.save();

//     res.status(200).json({
//       message: "House details updated successfully",
//       data: house,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error during house update",
//       error: error.message,
//     });
//   }
// };
    
exports.getAllHouse = async (req,res)=>{
    try{
      const houses = await houseModel.find().populate({
        path:'category',
        select:'type'
      });
      if (!houses){
        return res.status(401).json({
          message: "houses not found"
        })
      }
      else{
        return res.status(200).json({
          message: ` You have ${houses.length} houses listed below`,
          data:houses
        })
      }
  
    }catch(error){
      res.status(500).json({
        message:error.message
      })
    }
  }
  
  exports.deleteOneHouse = async (req, res) => {
    try {
        const id = req.params.id;
        const house = await houseModel.findByIdAndDelete(id);
        const agent = await agentModel.find()

        if(!house){
          return res.status(404).json({
              message: 'House does not exist'
          })
      }
        if(agent.isVerified = false){
          return res.status(400).json({
            message:`Your account has not been verified you can't delete this property`
          })
        }
    
        //fetch category
        const category = await cateModel.findOne({house:id})

        if(category){
          //removing the ID from the category's house array
          category.house = category.house.filter(houseId => houseId.toString() !== id)
          await category.save()
        }
      
        res.status(200).json({
            message: 'House deleted'
        })
    }catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
  
  exports.deleteAllHouses = async (req, res) => {
    try {
       
        const house = await houseModel.findByIdAndDelete();
 
       

        res.status(200).json({
            message: 'Houses deleted'
        })
    }catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}