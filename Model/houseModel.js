const mongoose = require('mongoose')

const houseModel = new mongoose.Schema({
    type:{
    type:String
 },
 location:{
    type:String
 },
 images:{
    type:[String]
 },
 amount:{
    type:String
 },
 description:{
    type:Array,
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