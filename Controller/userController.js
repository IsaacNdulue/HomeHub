const userModel= require('../Model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {userValidation} = require('../middleware/userValidator')
const sendEmail= require('../helper/email')
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

            await user.save();
            return res.status(201).json({
                message: 'Account created successfully',
                user
            });
                
        }
            } catch (error) {
              
              return res.status(500).json({
            message: error.message
            })
    }
}




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
  
        return res.status(201).json({
            message: "Login successfully", 
            token: token,
            checkUser
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
            const html = forgetPassMail(link, name)
            sendEmail({
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

        if(password !== confirmPassword){
            return res.status(400).json({
                message: 'Password do not match'
            })
        }
        const salt = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(password, salt);

        const data = { password: hashPassword}

        const reset = await userModel.findByIdAndUpdate(id, data, { new: true })
        // await reset.save();
        res.status(200).json('Your password has been changed')

    } catch (error) {
        res.status(500).json({
            message: error.message
        })

    }
}

//Get all Users on this platform
const allUsers = async (req,res)=>{
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
const oneUser = async (req,res)=>{
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
const addToFavorite = async(req, res)=>{
    try {
      const propertyId = req.params.id;
      const userId = req.user.userId;
      // Find the post by its ID
      const property = await houseModel.findById(propertyId);
      if (!property) {
          return res.status(404).json('Property not found');
      }
       // Find the user
       const checkUser = await userModel.findById(userId);
       if (!checkUser) {
           return res.status(404).json('User not found');
       }
       const isAlreadyFavorite = checkUser.favorites.includes(propertyId)
       if(isAlreadyFavorite){
        return res.status(400).json('Property is already added to favorite')
       }
        // Add the property to the user's favorites
      checkUser.favorites.push(propertyId);
      await checkUser.save();
      return res.status(200).json({message: 'Property added to favourite successfully', checkUser})
      
    } catch (error) {
      return res.status(500).json(error.message)
      
    }
  }

  const getUserFavorites = async(req,res)=>{
    try {
        const userId = req.user.userId
        const checkUser = await userModel.findById(userId)
        if(!checkUser){
            return res.status(404).json({
                message: 'User not Found'
            })
        }
        const userFavorites = await houseModel.find({_id: {$in: checkUser.favorites} })
        return res.status(200).json({
            message: `${userFavorites.length} propert(ies) are found in your favorites`,
            data: userFavorites
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
  }

 
  const removeFromFavorite = async(req, res)=>{
    try {
      const propertyId = req.params.id
      const userId = req.user.userId
//Find the post ID
   const property = await houseModel.findById(propertyId)
   if(!property){
   return res.status(400).json('Property not Found')
}
  //Find the user
  const checkUser = await userModel.findById(userId)  
   if(!checkUser){
   return res.status(404).json('User not Found')
}
  // Check if the post is in the user's favorites
   const propertyIndex = checkUser.favorites.indexOf(propertyId);
  if (propertyIndex === -1) {
   return res.status(400).json('Property is not in favorites');
}else{
     // Remove the post from the user's favorites
  checkUser.favorites.splice(propertyIndex, 1);
  await checkUser.save();
  return res.status(200).json({message: 'Property removed from favorites successfully', checkUser})

}

    } catch (error) {
      return res.status(500).json({error: error.message})
      
    }
  }

//User can delete their account
const deleteUserAccount = async (req, res) => {
    try {
        // track the user id
        const id = req.params.id;
       
        //track user with the id gotten
        const checkUser = await userModel.findById(id); 
       
        // check for error
        if (!checkUser) {
          return  res.status(404).json({
                message: `User is not found`
            })
        }
        // delete the user from the model
        await userModel.findByIdAndDelete(id)
        return res.status(200).json('Account deleted successfully')
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
        const user = await userModel.findById(userId);

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

module.exports = {signUp, logIn, update, addToFavorite, getUserFavorites, removeFromFavorite, deleteUserAccount, 
                    forgotPassword, resetPassword, allUsers, oneUser, logOut}