const agentModel = require('../Model/agentModel')
const cateModel = require('../Model/CateModel')
const house = require('../Model/houseModel')
const houseModel = require('../Model/houseModel')
const cloudinary = require('../Utility/cloudinary.js')
const jwt = require("jsonwebtoken")

exports.postHouse = async (req,res)=>{
  try {
    //  const id = req.params.categoryId;
    const {type, location,description,amount,categoryId} = req.body;
   
    //Extratct agents's info from the token
    const agentToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(agentToken, process.env.jwtSecret);
    const agentId = decoded.agentId
    //finding the agent using the extracted agentId
    const agent = await agentModel.findById(agentId);

    
    // const agent = await agentModel.findById()
    
    if(!agent){
      return res.status(400).json({
        message:'You are not logged in'
      });
    }
    if(!agent.isVerified){
      return res.status(400).json({
        message:`Can't post Please verify your account via link sent to ${agent.email}`
      })
    }
    // if(agent.isGood === false){
    //   return res.status(400).json({
    //     message:`Can't post, your account is under review`
    //   })
    // }
    const category = await cateModel.findById(categoryId)


    if(!category){
      return res.status(400).json({
        message:'Category does not exist'
      });
    }
    // const file = req.file.Images.path
    // const result = await cloudinary.uploader.upload(file)
const uploadedImages = await Promise.all(
  req.files.map(async (file)=>{
    const result = await cloudinary.uploader.upload(file.path, {resource_type:'auto'})
    return result.secure_url;
  })
)
    const house = await houseModel.create({
      type,
      location,
      images:uploadedImages,
      amount,
      description,
      categoryId,
      agentId: agent._id

       
    });
   

    category.house.push(house._id);
    house.category = categoryId


    await category.save()
    await house.save();

    res.status(201).json({
      message:'House posted successfully',
      data:house
    })
  } catch (error) {
    res.status(500).json({
      message:'internal Server Error',
      message: error.message
    })
  }
}

exports.sponsorPost = async(req,res)=>{
  try {
    const houseId = req.params.houseId;
    //get the original house from database
    const originalHouse = await houseModel.findById(houseId)

    if(!originalHouse){
      return res.status(404).json({
        message:"Original house not found",
      });
    }

    // create a new sponsored post based on the original house details

    const sharedHouse = new house({
      type:originalHouse.type,
      location:originalHouse.location,
      description:originalHouse.description,
      amount:originalHouse.amount,
      isSponsored:true,
      agentId:originalHouse.agentId,
      images:originalHouse.images

    })

    await sharedHouse.save();

    res.status(201).json({
      message:"House shared and sponsored successfully",
      data:sharedHouse
    });

  } catch (error) {
    res.status(500).json({
      message:"Error during sponsoring",
      error:error.message
    })
  }
}

exports.getAgentSponsoredPost = async(req,res)=>{
  try{
    const id = req.params.id
    const agent = await agentModel.findById(id)
    const sponsoredPosts = await houseModel.find({
      agentId:agent,
      isSponsored:true
    })
    res.status(200).json({
      message:`Sponsored posts for agent ${agentId} within last week`,
      data:sponsoredPosts
    })

  }catch(error){
    res.status(500).json({
      message:"Error during retrieving sponsored posts",
      error:error.message
    })
  }
}
const cron = require ('node-cron');

cron.schedule('0 0 * * *', async()=>{
  try {
    
    //find and update houses where isSponsored is true and created more than one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await houseModel.updateMany(
      {
      isSponsored:true,
      createdAt:{ $lt: OneWeekAgo},
    },
    { $set:{ isSponsored:false}}
    );

    console.log('Cron job executedsuccessfully.');

  } catch (error) {
    console.error('Error during cron job:', error.message);
  }
})

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

exports.updateHouse = async (req,res)=>{
    try{
      const id = req.params.id
      const {title,desc,Images}= req.body
      const updatedhouse= await houseModel.findByIdAndUpdate(id,{title,desc,Images},{new:true})
    
      if(!updatedhouse){
        return res.status(400).json({
          message:'house not updated',
        })
      }
      else{
        return res.status(200).json({
          message: "updated successfully",
          data:updatedhouse
        })
      }
    }catch(error){
      res.status(500).json({
        message: error.message
      })
    }
    
    }
    
    
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
        if(agent.isVerified = false){
          return res.status(400).json({
            message:`Your account has not been verified you can't delete this property`
          })
        }
    
        if(!house){
            return res.status(404).json({
                message: 'House does not exist'
            })
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