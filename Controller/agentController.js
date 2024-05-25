const agentModel = require('../Model/agentModel')
const cateModel = require('../Model/CateModel')
const houseModel = require('../Model/houseModel.js')
const bcrypt = require('bcrypt')
const sendEmail = require('../helper/email')
const validation = require('../middleware/validation')
const forgetPassMail= require('../ForgetPass')
const cloudinary = require('../Utility/cloudinary.js')

const jwt = require("jsonwebtoken")
const generateDynamicEmail =require('../html.js')

exports.signUp = async(req,res)=>{
    try {
        const {companyName,fullName,email,phoneNumber,password,confirmPassword,address} = req.body
        // const file = req.files

        const existingAgent = await agentModel.findOne({ $or: [{ companyName }, { email }] });
        if (existingAgent) {
            if (existingAgent.companyName === companyName) {
                return res.status(400).json({
                    message: `A company with name ${existingAgent.companyName} already exists`
                });
            } else {
                return res.status(400).json({
                    message: 'Email already exists'
                });
            }
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

        const documentImageFile = req.files['documentImage'][0].path;
        const documentImageResult = await cloudinary.uploader.upload(documentImageFile, {
            folder: "HomeHubAgentDocument",
            resource_type: 'auto' 
        });
        
        const regCertFile = req.files['regCert'][0].path;
        const regCertResult = await cloudinary.uploader.upload(regCertFile, {
            folder: "HomeHubAgentDocument", 
            resource_type: 'auto'
        });
        

        const agent = await agentModel.create({
            companyName,
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
        }, process.env.jwtSecret, {expiresIn:'5m'})
        
        await agent.save()
        // .toUpperCase().slice(0, fullName.indexOf(" "))
          // Sending a verification email to the agent

          const subject = 'welcome to homehub';
          const link = `${req.protocol}://${req.get('host')}/api/verify/${agent._id}/${token}`;
          const html = generateDynamicEmail(link, agent.companyName);
          await sendEmail({
              email: agent.email,
              subject,
              html
          });

          const adminEmail = 'homehub95@gmail.com';
          const adminSubject = 'New Agent Registration';
          
          const adminHtml = `
          <!DOCTYPE html>
          <html lang="en">
          
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New User Registration</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      padding: 20px;
                  }
          
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 5px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
          
                  .header {
                      text-align: center;
                      margin-bottom: 20px;
                  }
          
                  .content {
                      margin-bottom: 20px;
                  }
          
                  .user-info {
                      margin-bottom: 10px;
                  }
              </style>
          </head>
          
          <body>
              <div class="container">
                  <div class="header">
                      <h2>New Agent Registration</h2>
                  </div>
                  <div class="content">
                      <p>Hello Admin,</p>
                      <p>We are pleased to inform you that a new Agent has recently signed up on Home Hub. Here are the agent's details:</p>
                      <div class="user-info">
                          <strong>Full Name:</strong> ${fullName}
                      </div>
                      <div class="user-info">
                          <strong>User Name:</strong> ${companyName}
                      </div>
                      <div class="user-info">
                          <strong>Email:</strong> ${email}
                      </div>
                      <p>Date of Signup: ${new Date().toLocaleDateString()}</p>
                      <p>Time of Signup: ${new Date().toLocaleTimeString()}</p>
                      <p>Please take the necessary steps to welcome and onboard the new agent into your system. If you have any further questions or require additional info, feel free to reach out to the software engineering team.</p>
                      <p>Best Regards,</p>
                      <p>Home Hub software engineers</p>
                  </div>
              </div>
          </body>
          
          </html>
          
          `;
          
          await sendEmail({
              email: adminEmail,
              subject: adminSubject,
              html: adminHtml
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
      const agentExist = await agentModel.findOne({email:email.toLowerCase()});
  
      if(!agentExist){
        return res.status(401).json({
          message:'Invalid email or password',
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

    const token = jwt.sign({
        agentId:agentExist._id,
        email:agentExist.email
    }, process.env.jwtSecret, { expiresIn: "36500d" })
    

    await agentExist.save()
     
    res.status(200).json({
    message:'Login successful',
    token,
    agentExist
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

const id = req.params.id
const token=req.params.token
const agent= await agentModel


//check if the decoded token contains the expected agent's ID
if (!id){
    return res.status(404).json({
        error:'agent not found'
    })
}
if (agent.isVerified == true){
    res.redirect(`https://homehub-ten.vercel.app/agentlogin`);
}
// console.log(token)
await jwt.verify(token, process.env.jwtSecret,async(error,value)=>{
    if(error){
        const token = await jwt.sign({
            agentId:agent._id,
            email:agent.email
        }, process.env.jwtSecret, {expiresIn:'5m'})
        
        const subject = 'Verify your account again';
        const link = `${req.protocol}://${req.get('host')}/api/verify/${agent._id}`;
        const html = generateDynamicEmail(link, agent.companyName);
         sendEmail({
            email: agent.email,
            subject,
            html
        });
    }else{
        return value
    }
})

const verifyAgent = await agentModel.findByIdAndUpdate(id,{isVerified:true},{new:true})

//  res.status(200).json({
//      message:`user with email:${verifyAgent.email} has been verified successfully`,
 
// })
//handle your redirection here
res.redirect(`https://homehub-ten.vercel.app/agentlogin`);


}catch(err){
   //handle JWT verification errors
    // if(err instanceof jwt.TokenExpiredError){
    //     return res.status(401).json({
    //         error:'Token expired'
    //     });
    // }else if(err instanceof jwt.JsonWebTokenError){
    //     return res.status(401).json({
    //         error:'Invalid token'
    //     })
    // }
    res.status(500).json({
        error:err.message
    })
   
}
}


exports.agentForgotPassword = async (req,res)=>{
    try {
        //get the email of the user
        const {email} = req.body
        //find the user data from the database using the email provided
        const agent = await agentModel.findOne({email:email.toLowerCase()});
        //check if the user exists in our database
        if (!agent){
            return res.status(404).json({
                message:'Agent not found'
            })
        };
         const name = agent.companyName
        //if a user is found generate a token for user
        const token = jwt.sign({agentId:agent._id}, process.env.jwtSecret, {expiresIn: '10m'});

        const link = `https://homehub-coxc.onrender.com/api/AgentResetPassword/${token}`
        const html = forgetPassMail(link,name)
        await sendEmail({
            email: agent.email,
            subject:"Password reset",
            html
        })
        //send a success response
        res.status(200).json({
            message:'Reset password email sent'
        })
    } catch (error) {
        res.status(500).json({
          error:  error.message
        })
    }
}


exports.AgentResetPassword = async (req, res)=> {
    try {
    // get the token from the params
    const {token} = req.params;
    //get the new password from the body
    const {newPassword, confirmPassword} = req.body;
        //verify the validity of the token
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Password does not match"
            })
        }

    const decodedToken = jwt.verify(token, process.env.jwtSecret)

     //find the agent of the token by the id
     const agentExist = await agentModel.findById(decodedToken.agentId)
     if (!agentExist) {
         return res.status(404).json({
             message: " Agent not found "
 
         })
     }
    //  console.log(user);
    //encrypt the users new password
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(newPassword, salt)

        //update the agnet password in the database
        agentExist.password = hash;

        //save the changes to the database
    await agentExist.save()

     //send a success response
     res.status(200).json({
        message: "Password reset successfully"
    })
  }catch (error) {
        res.status(500).json(error.message)
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
            message:`${updateAdmin.companyName} has been made Admin`
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.updateIsGood = async (req,res)=>{
    try {
       // Check if the user making the request is an Admin
       if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized. Must be an Admin' });
    }
       const agentId = req.params.id || req.body.agentId;

       //find the agent in database
       const agent = await agentModel.findById(agentId);

       if(!agent){
        return res.status(404).json({error:'Agent not found.'})
       }
        //Update isGood to true
        agent.isGood = true;

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
                error: "No agent found"
            })
        }

        //show the users active
        res.status(200).json({
            messsage: `You have ${agent.length} agent'(s) and here they are`,
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
            messsage:`Houses posted by ${agent.companyName} under for sale`,
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
            messsage:`Houses posted by ${agent.companyName} under for rent are listed below`,
           
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
            messsage:`Houses posted by ${agent.companyName} under for rent are listed below`,
           
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
        console.log(`Attempting to delete agent with ID: ${id}`);

        // Find the agent by ID
        const agent = await agentModel.findById(id);
        if (!agent) {
            console.log('Agent not found');
            return res.status(404).json({
                message: 'Agent does not exist'
            });
        }
        console.log(`Agent found: ${agent}`);

        // Find all houses uploaded by the agent
        const houses = await houseModel.find({ agent: id });
        console.log(`Houses found: ${houses.length}`);

        // Delete all found houses
        if (houses.length > 0) {
            const houseDeletionPromises = houses.map(house => houseModel.findByIdAndDelete(house._id));
            await Promise.all(houseDeletionPromises);
            console.log('All houses deleted');
        }

        // Delete the agent
        await agentModel.findByIdAndDelete(id);
        console.log('Agent deleted');

        res.status(200).json({
            message: 'Agent and their houses deleted'
        });
    } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({
            message: error.message
        });
    }
};


exports.logOut= async (req,res)=>{
    try{
      const hasAuthorization = req.headers.authorization
  
      if(!hasAuthorization){
          return res.status(400).json({
              error:"Authorization token not found"
          })
      }
  
      const token = hasAuthorization.split(" ")[1]
    //   console.log(token)
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
      agent.token = null;

    //   agent.blackList.push(token)
      await agent.save()
    // agent.token=null
  
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