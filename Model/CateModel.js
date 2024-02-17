const mongoose = require('mongoose')

const cateSchema = new mongoose.Schema({
    type:{
        type:String,
        required:true,
    },
    // desc:{
    //     type:String
    // },
    agentId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'agentModel'
      },
    house:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'house'
    }]
})

const cate = mongoose.model('category', cateSchema)

module.exports = cate