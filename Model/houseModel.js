const mongoose = require('mongoose')

const houseModel = new mongoose.Schema({
    type:{
    type:String
 },
 location:{
    type:String
 },
 images:{
    type:Array,
    required:true
 },

 amount:{
    type:String
 },
 description:{
    type:String,
    required:true
 },
 timestamp:{
    type:Date,
    default:Date.now
 },
 isSponsored:{
   type:Boolean,
   default:false
 },
 isVerified:{
   type:Boolean,
   default:false
 },
 agentId:{
   type:mongoose.SchemaTypes.ObjectId,
   ref:'agentModel'
 },
 category:{
    type:mongoose.SchemaTypes.ObjectId,
    ref:'category'
 }

})

 const house = mongoose.model('house', houseModel)
 module.exports = house