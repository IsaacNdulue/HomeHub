//userModel
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({

fullName:{
   type: String
},
email:{
   type: String,
   unique: true,
},
phoneNumber:{
   type:String
},
password:{
   type:String
},
confirmPassword:{
   type:String
},
isVerified:{
   type: Boolean,
   default: false
},
favorite:[{
   type: String
}],
token:{
   type: String
}
}, {timestamps: true})

const userModel=  mongoose.model("User", UserSchema);

module.exports= userModel