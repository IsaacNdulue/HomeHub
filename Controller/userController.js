//userController

const userModel= require('../Model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {userValidation} = require('../middleware/userValidator')
const sendEmail= require('../helper/email')
const welcomeEmail= require('../wHtml')
const generateDynamicEmail= require('../html')
const forgetPassMail= require('../ForgetPass')
require('dotenv').config()



const signUp = async (req,res)=>{
    try {
        const {error} = await userValidation(req.body);
        if(error){
            return res.status(500).json({message: error.details[0].message})
        } else{
            const {fullName, email, password, phoneNumber, confirmPassword} = req.body;
            
            const checkUser = await userModel.findOne({email: email.toLowerCase()})
            if(checkUser){
                return res.status(400).json('Email Already Exist')
            }
    
            const salt =  bcrypt.genSaltSync(12);
            const hashPassword = bcrypt.hashSync(password, salt)
    
            if(password !== confirmPassword){
                return res.status(400).json('Password do not match')
            }
            
            const user = await userModel.create({
                fullName,
                email:email.toLowerCase(),
                password:hashPassword,
                phoneNumber,  
            })
            // const name = user.fullName.split(' ')[0];  

            const token = jwt.sign({
                fullName:user.fullName,
                id:user._id,
                email: user.email 
             }, process.env.jwtSecret, {expiresIn: '5min'})

             user.token=token
             //const name = user.fullName.split(' ')[0];
            
            const subject = "welcome to home hub"
            // const link = `${req.protocol}://${req.get('host')}/api/verify/${user.id}`
            const html = welcomeEmail( user.fullName.toUpperCase().slice(0, fullName.indexOf(" ")))
            sendEmail({
                email:user.email,
                subject,
                html
            })
            await user.save();
            return res.status(201).json({
                message: 'Account created successfully',
                user
            });
                
        }
            } catch (error) {
                //handle JWT verification errors
            if(error instanceof jwt.TokenExpiredError){
              return res.status(401).json({
            error:'Token expired'
           });
           }else if(error instanceof jwt.JsonWebTokenError){
              return res.status(401).json({
            error:'Invalid token'
            })
        }
              return res.status(500).json({
            message: error.message
            })
    }
}


  
const  verify = async(req,res)=>{
    try{
// const id = req.params.id
const id = req.params.id

 
// const decoded = jwt.verify(agentToken,process.env.jwtSecret)

if (!id){
    return res.status(404).json({
        error:'User not found'
    })
}

const verifyAgent = await userModel.findByIdAndUpdate(id,{isVerified:true},{new:true})

res.status(200).json({
    message:`user with email:${verifyAgent.email} has been verified successfully`,
    data:verifyAgent
})


//handle your redirection here
// res.redirect('/api/login')
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
        message:'internal error',
        error:err.message
    })
   
}
}

// const verify = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const checkUser = await userModel.findById(id);
//         console.log(checkUser)
//         if (!checkUser) {
//             return res.status(404).json('User not found');
//         }
//         const name = checkUser.fullName.split(' ')[0];
    

//         if (checkUser.isVerified) {
//             return res.status(400).json('User already verified');
//         }
         
//         // Verify the token
//         jwt.verify(checkUser.token, process.env.jwtSecret, async (error) => {
//             if (error) {
//              const token = jwt.sign({ fullName: checkUser.fullName, email: checkUser.email }, process.env.jwtSecret, { expiresIn: "5min" });
//              checkUser.token = token;
//              const link = `${req.protocol}://${req.get("host")}/api/verify/${checkUser.id}/${checkUser.token}`;
//               await sendEmail({
//                     email: checkUser.email,
//                     subject: `RE-VERIFY YOUR ACCOUNT`,
//                     html: generateDynamicEmail(link, name),
//                 });
//                 return res.status(400).json("This link has expired. Kindly check your email for another email to verify");
//             }

//             // Token is verified, mark user as verified
//             checkUser.isVerified = true;

//             await checkUser.save();
//             return res.status(201).json({message:`Congratulations ${name}, you have been verified`});
//         });
//         res.redirect(`http:${req.get('host')}/login`)

//     } catch (error) {
//         //handle JWT verification errors
//     if(err instanceof jwt.TokenExpiredError){
//         return res.status(401).json({
//             error:'Token expired'
//         });
//     }else if(err instanceof jwt.JsonWebTokenError){
//         return res.status(401).json({
//             error:'Invalid token'
//         }) 
//     }

//         return res.status(500).json({
//             message:'internal error',
//             error:error.message
//         });
//     }
// }



const logIn = async(req,res)=>{
    try {
        //Get the user login details
        const {email, password}=req.body;
        const checkUser = await userModel.findOne({email})
        
        if(!checkUser){
            return res.status(404).json('Invalid Email or Password')
        }
          
       const checkPassword = bcrypt.compareSync(password, checkUser.password);
        if(!checkPassword){
             return res.status(404).json('Invalid Email or Password')
          }

          const token = jwt.sign({
            userId: checkUser._id,
            email: checkUser.email
        }, process.env.jwtSecret, { expiresIn: '1d' })

        checkUser.token = token
        await checkUser.save()

         // Check if a User is verified before accessing the platform
    
       
  
        return res.status(201).json({
            message: "Login successfully", 
            token: token
        })
   
    } catch (error) {
        return res.status(500).json(error.message)
        }
}


const update = async(req,res)=>{
    try {
        const id= req.user.userId
        const checkUser = await userModel.findById(id)
        if(!checkUser){
            return res.status(404).json('User not Found')
        }
        const Data ={
            fullName:req.body.fullName || checkUser.fullName,
            email:req.body.email || checkUser.email,
            phoneNumber:req.body.phoneNumber || checkUser.phoneNumber,
        }
        const updatedDetails = await userModel.findByIdAndUpdate(id, Data, {new: true});
        return res.status(201).json({
            message: 'Details Updated successfully',
            updatedDetails
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
} 
const forgotPassword = async (req, res) => {
    try {
        const checkUser = await userModel.findOne({ email: req.user.email })
        const name = checkUser.fullName.split(' ')[0];
    
        if (!checkUser) {
            return res.status(404).json('Email does not exist')
        } else {
            const subject = "Forgot Password"
            const link = `${req.protocol}://${req.get('host')}/api/resetPassword/${checkUser.id}/${checkUser.token}`
            const html = resetFunc(link, name)
            forgetPassMail({
                email: checkUser.email,
                subject,
                html
            })

            return res.status(200).json("Kindly check your email for a link to reset password")
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const {password, confirmPassword} = req.body
        const id = req.user.userId

        const salt = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(password, salt);

        const data = { password: hashPassword}

        const reset = await User.findByIdAndUpdate(id, data, { new: true })
        // await reset.save();
        res.status(200).json('Your password has been changed')

    } catch (error) {
        res.status(500).json({
            message: error.message
        })

    }
}

//Get all Users on this platform
const getAll = async (req,res)=>{
    try {
        const allUsers = await userModel.find().select(['-phoneNumber'])
        if(allUsers.length === 0){
           return res.status(200).json({
            message: 'No User Found'
           })
        } else {
            return res.json({
                message: `There are ${allUsers.length} Users in the Database`,
                allUsers
            })
        }
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

//Get one User on this Platform
const getOne = async (req,res)=>{
    try {
        const userId = req.params.id
        const checkUser = await userModel.findById(userId);
        const name = checkUser.fullName.split(' ')[0];
        if(!checkUser){
            return res.status(404).json('User not Found')
        } else{
            return res.json({
                message: `${name} Account information`,
                checkUser
            })
        }
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

const houseModel = require('../Model/houseModel')
// Function to add post to favourite
const favoriteProperty = async(req, res)=>{
    try {
      const postId = req.params.postId;
      const userId = req.user.userId;
      // Find the post by its ID
      const post = await houseModel.findById(postId);
      if (!post) {
          return res.status(404).json('Post not found');
      }
       // Find the user's blog
       const checkUser = await userModel.findById(userId);
       if (!checkUser) {
           return res.status(404).json('User not found');
       }
       const isAlreadyFavorite = checkUser.favorite.includes(postId)
       if(isAlreadyFavorite){
        return res.status(400).json('Post is already in favorite')
       }
        // Add the post to the user's favorites
      checkUser.favorite.push(postId);
      await checkUser.save();
      return res.status(200).json({message: 'Post added to favourite successfully', checkUser})
      
    } catch (error) {
      return res.status(500).json(error.message)
      
    }
  }
 
//   const removeFavorite = async(req, res)=>{
//     try {
//       const postId = req.params.postId
//       const userId = req.user.userId
// //Find the post ID
// const post = await postModel.findById(postId)
// if(!post){
// return res.status(400).json('Post not Found')
// }
// //Find the user
// const checkUser = await blogModel.findById(userId)
// if(!checkUser){
// return res.status(404).json('User not Found')
// }
// // Check if the post is in the user's favorites
// const postIndex = checkUser.favorite.indexOf(postId);
// if (postIndex === -1) {
//    return res.status(400).json('Post is not in favorites');
// }else{
//      // Remove the post from the user's favorites
// checkUser.favorite.splice(postIndex, 1);
// await checkUser.save();
// return res.status(200).json({message: 'Post removed from favorites successfully', checkUser})

// }

//     } catch (error) {
//       return res.status(500).json({error: error.message})
      
//     }
//   }

//User can delete their account
const deleteUser = async (req, res) => {
    try {
        // track the user id
        const id = req.params.id;
        console.log(id)
        //track user with the id gotten
        const checkUser = await User.findById(id); 
        console.log(checkUser)
        // check for error
        if (!checkUser) {
          return  res.status(404).json({
                message: `User ${fullName} is not found`
            })
        }
        // delete the user from the model
        await User.findByIdAndDelete(id)
        return res.status(200).json('Account deleted')
       // return res.redirect('/');

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

//Signout
const logOut = async (req, res) => {
    try {
        const userId = req.user.userId

        // Find the user by username
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Invalidate the token by setting it to null
        user.token = null;
        await user.save();

        res.status(200).json({ message: 'logout successful' });
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        
    }
}

module.exports = {signUp, verify, logIn, update, favoriteProperty, deleteUser, 
                    forgotPassword, resetPassword, getAll, getOne, logOut}