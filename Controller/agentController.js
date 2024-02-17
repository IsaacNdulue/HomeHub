const agentModel = require('../Model/agentModel')
const cateModel = require('../Model/CateModel')
const houseModel = require('../Model/houseModel.js')
const bcrypt = require('bcrypt')
const sendEmail = require('../helper/email')
const validation = require('../middleware/validation')
const cloudinary = require('../Utility/cloudinary.js')

const jwt = require("jsonwebtoken")
const generateDynamicEmail =require('../html.js')

exports.signUp = async(req,res)=>{
    try {
        const {fullName,email,phoneNumber,password,confirmPassword,address} = req.body
        // const file = req.files

        const exisitingAgent = await agentModel.findOne({email});
        if(exisitingAgent){
            return res.status(400).json({
                message:'User already exist',
                data:exisitingAgent
            })
        }
        if(confirmPassword !== password){
            return res.status(400).json({
            message:'Password does not match'
            })
        }
        await validation.validateAsync({fullName,email,phoneNumber,password,confirmPassword},(err,data)=>{
            if(err){
              res.json(err.message)
            }else{
      
              res.json(data)
      
            }
          })
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const documentImageFile = req.files['documentImage'][0].path
        const documentImageResult = await cloudinary.uploader.upload(documentImageFile)
        // const file = req.files.regCert

        const regCertFile = req.files['regCert'][0].path
        const regCertResult = await cloudinary.uploader.upload(regCertFile)
        // const result = await cloudinary.uploader.upload(files.path)
        const agent = await agentModel.create({
            fullName,
            email:email.toLowerCase(),
            phoneNumber,
            password:hash,
            address,
            regCert:regCertResult.secure_url,
            documentImage:documentImageResult.secure_url
         
            


        })
        const token = jwt.sign({
            agentId:agent._id,
            email:agent.email
        }, process.env.jwtSecret, {expiresIn:'1d'})

        
        await agent.save()

          // Sending a verification email to the agent

          const subject = 'Kindly verify your account';
          const link = `${req.protocol}://${req.get('host')}/updateuser/${agent.x}/${agent.token}`;
          const html = generateDynamicEmail(link, agent.fullName.toUpperCase().slice(0, fullName.indexOf(" ")));
          await sendEmail({
              email: agent.email,
              subject,
              html
          });
    
        return res.status(200).json({
            message:('Agent registered'),
            token,
            agent
        })

    } catch (error) {
        return res.status(500).json({
            message:'User not created',
            error:error.message
        })
    }
}



exports.login = async (req,res) => {
    try {
      const {email,password} = req.body;
      const agentExist = await agentModel.findOne({email});

//   console.log(agentExist)
   
  
      if(!agentExist){
        return res.status(401).json({
          message:'Invalid agent',
        });
      }
  
      if(!agentExist.isVerified){
        return res.status(400).json({
          error:`Please Verify your account through the link sent to ${agentExist.email}`,
        });
      }
      const checkPassword = bcrypt.compareSync(password, agentExist.password)
      if(!checkPassword){
        return res.status(400).json({
            error: "Incorrect password"
        })
    }

    //   agent.logOut = false

      
  
     const agent = await agentExist.save()
     
    res.status(200).json({
    message:'Login succesful',
    data:agent,
   })
  
    } catch (error) {
      res.status(500).json({
        message:'Error during Login',
        error:error.message
      });
    }
  
  };

  
exports.verify = async(req,res)=>{
    try{
// const id = req.params.id
const agentToken = req.params.userToken
 
const decoded = jwt.verify(agentToken,process.env.jwtSecret)

//getting my agent's id from the token
const id = decoded.agentId;
//check if the decoded token contains the expected agent's ID
// if (decoded.agentId !== id){
//     return res.status(403).json({error:'Invalid token for this agent'})
// }

const verifyAgent = await agentModel.findByIdAndUpdate(id,{isVerified:true},{new:true})

if (!verifyAgent){
    return res.status(404).json({
        error:'agent not found'
    })
}

res.status(200).json({
    message:`user with email:${verifyAgent.email} has been verified successfully`,
    data:verifyAgent
})
}catch(err){
   //handle JWT verification errors
    if(err instanceof jwt.TokenExpiredError){
        return res.status(401).json({
            error:'Token expired'
        });
    }else if(err instanceof jwt.JsonWebTokenError){
        return res.status(401).json({
            error:'Invalid token'
        })
    }
    res.status(500).json({
        error:err.message
    })
   
}
}

exports.MakeAdmin = async (req,res)=>{
    try {
  
        const agentToken = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(agentToken, process.env.jwtSecret);
        const agentId = decoded.agentId

        const agent = await agentModel.findById(agentId);
        if(!agent){
            return res.status(404).json({
                message:'Agent not found'
            })
        }
        if(agent.isAdmin === true){
            return res.status(400).json({
                message:'Agent is already an admin'
            })
        }
        const updateAdmin = await agentModel.findByIdAndUpdate(agentId,{isAdmin:true},{new:true})
        return res.status(200).json({
            message:`${agent.fullName} has been verified`
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.updateIsGood = async (req,res)=>{
    try {
       // check if the user making the request is an Admin
       if(!req.user.isAdmin){
        return res.status(i403).json({error:'Unauthorized. Must be Admin'})
       }
       const agentId = req.params.id || req.body.agentId;

       //find the agent in database
       const agent = await agentModel.findById(agentId);

       if(!agent){
        return res.status(404).json({error:'Agent not found.'})
       }
        //Update isGood to true
        agent.isGood = true

    await agent.save()
    res.status(200).json({message:'isGood is updated, agent can make posts now'})
       
    } catch (error) {
        res.status(500).json({ error:error.message})
    }
}
  //get all agent
exports.getAllAgent = async(req,res)=>{
    try{

        //fetch agent in the database
        const agent = await agentModel.find().populate('house')

        //check if there is an agent
        if(!agent){
            return res.status(404).json({
                error: "no agent found"
            })
        }

        //show the users active
        res.status(200).json({
            messsage: `you have ${agent.length} agent'(s) and here they are`,
            data:agent
        })

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}

  //get One agent
exports.getOneAgent = async(req,res)=>{
    try{

        //fetch agent in the database
        const id = req.params.id
        const agent = await agentModel.findById(id).populate('house')

        //check if there is an agent
        if(!agent){
            return res.status(404).json({
                error: "no agent found"
            })
        }

        //show the users active
        res.status(200).json({
            messsage:'Your selected agent',
            data:agent
        })

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}
exports.getAgentHouses = async(req,res)=>{
    try{

        //fetch agent in the database
        const id = req.params.id
        const agent = await agentModel.findById(id)

        //check if there is an agent
        if(!agent){
            return res.status(404).json({
                error: "Agent not found"
            })
        }
        const houses = await houseModel.find({agentId: agent._id}).populate('');

        
        res.status(200).json({
            messsage:`Houses posted by ${agent.fullName} are ${houses.length} listed below`,
            
             houses
        })

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}
exports.getAgentHousesForSale = async(req,res)=>{
    try{
        //fetch agent in the database
        const id = req.params.id
        const agent = await agentModel.findById(id)

        //check if there is an agent
        if(!agent){
            return res.status(404).json({
                error: "Agent not found"
            })
        }
        const housesForSale = await houseModel.aggregate([
            {
            $match:{agentId: agent._id}
        },
        {
            $lookup:{
                from:'categories',
                localField:'category',
                foreignField:'_id',
                as:'category'
            }
        },
        {
            $unwind:"$category"
        },
        {
            $addFields:{
                agentId:"$agentId",
                categoryId:"$category._id",
                categoryName:"$category.type"
            }
        },
        {
            $match:{'category.type': 'For Sale',
        //  'category.agentId': agent._id
    }
        }
    ])
    // console.log('Houses for Sale', housesForSale)

        res.status(200).json({
            messsage:`Houses posted by ${agent.fullName} under for sale`,
            housesForSale
        })

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}
exports.getAgentHousesForRent = async(req,res)=>{
    try{

        //fetch agent in the database
        const id = req.params.id
        const agent = await agentModel.findById(id)

        //check if there is an agent
        if(!agent){
            return res.status(404).json({
                error: "Agent not found"
            })
        }
        const housesForRent = await houseModel.find({agentId: agent._id}).populate({
            path:'category',
            match:{type:"For Rent"}
        });

        const filteredHousesForRent = housesForRent.filter(house => house.category)
        

        res.status(200).json({
            messsage:`Houses posted by ${agent.fullName} under for rent are listed below`,
           
            housesForRent:filteredHousesForRent
        })

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}

        
exports.getAgentHousesForRent = async(req,res)=>{
    try{

        //fetch agent in the database
        const id = req.params.id
        const agent = await agentModel.findById(id)

        //check if there is an agent
        if(!agent){
            return res.status(404).json({
                error: "Agent not found"
            })
        }
        const housesForRent = await houseModel.find({agentId: agent._id}).populate({
            path:'category',
            match:{type:"For Rent"}
        });

        const filteredHousesForRent = housesForRent.filter(house => house.category)
        

        res.status(200).json({
            messsage:`Houses posted by ${agent.fullName} under for rent are listed below`,
           
            housesForRent:filteredHousesForRent
        })

    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}


// exports.getAgentHouses = async(req,res)=>{
//     try{

//         //fetch agent in the database
//         const id = req.params.id
//         const agent = await agentModel.findById(id)

//         //check if there is an agent
//         if(!agent){
//             return res.status(404).json({
//                 error: "Agent not found"
//             })
//         }
//         const housesForRent = await houseModel.find({agentId: agent._id}).populate({
//             path:'category',
    
//         });

//         const filteredHousesForRent = housesForRent.filter(house => house.category)
        

//         res.status(200).json({
//             messsage:`Houses posted by ${agent.fullName} are listed below`,
           
//             housesForRent:filteredHousesForRent
//         })

//     }catch(error){
//         res.status(500).json({
//             error:error.message
//         })
//     }
// }

exports.getHousebyCate = async (req, res) => {
    try {
        const id = req.params.categoryId;
        
        const category = await cateModel.findById(id).populate('house')
        // const agent =await agentModel.findById(agentId)
        // if(!agent){
        //     return res.status(404).json({
        //         message: 'Agent does not exist'
        //     })
        // }
        if(!category){
            return res.status(404).json({
                message: 'Category not found'
            })
        }
        res.status(200).json({
            message: "This is your Category",
            category
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


exports.deleteOneAgent = async (req, res) => {
    try {
        const id = req.params.id;
        const agent = await agentModel.findByIdAndDelete(id);
        if(!agent){
            return res.status(404).json({
                message: 'agent does not exist'
            })
        }
        res.status(200).json({
            message: 'agent deleted'
        })
    }catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.logOut= async (req,res)=>{
    try{
      const hasAuthorization = req.headers.authorization
  
      if(!hasAuthorization){
          return res.status(400).json({
              error:"Authorization token not found"
          })
      }
  
      const token = hasAuthorization.split(" ")[1]
      console.log(token)
      if(!token){
          return res.status(400).json({
              error: "Authorization not found"
          })
      }
  
      const decodeToken = jwt.verify(token, process.env.jwtSecret)
  
      const agent = await agentModel.findById(decodeToken.agentId)
      console.log(agent)
    
      if(!agent){
          return res.status(400).json({
              error: "Agent not found"
          })
      }
  
      agent.blackList.push(token)
      await agent.save()
  
      console.log(agent)
        res.status(200).json({
          message:`Agent has been logged out `,
          agent
        })
    }catch(err){
      res.status(500).json({
        message:err.message
      })
    }
  }