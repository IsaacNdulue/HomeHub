const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema({
     fullName:{
        type:String,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     phoneNumber:{
        type:String,
        required:true
     },
     password:{
        type:String,
        required:true
     },
     documentImage:{
      type:String
     },    
     regCert:{
      type:String
     },    
     address:{
      type:String
     },    
     isVerified:{
      type:Boolean,
      default:false
  },
     isGood:{
      type:Boolean,
      default:false
  },
     isAdmin:{
      type:Boolean,
      default:false
  },
  house:[{
   type:mongoose.SchemaTypes.ObjectId,
   ref:'house'
}],
category:{
   type:mongoose.SchemaTypes.ObjectId,
   ref:'category'
},
  blackList:{
   type:Array,
   default: false
}

},{timestamps:true})

const agentModel = mongoose.model('agentModel', agentSchema )

module.exports = agentModel