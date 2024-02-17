const jwt = require('jsonwebtoken')
const agentModel = require("../Model/agentModel")
require('dotenv').config




const authorization = async (req,res,next)=>{
    try{

        const hasAuthorization = req.headers.authorization

        if(!hasAuthorization){
            return res.status(400).json({
                error:"Authorization token not found"
            })
        }

        const token = hasAuthorization.split(" ")[1]

        if(!token){
            return res.status(400).json({
                error: "Authorization not found"
            })
        }

        const decodeToken = jwt.verify(token, process.env.jwtSecret)

        const agent = await agentModel.findById(decodeToken.agentId)
        console.log(agent)
     


        if(!agent){
            return res.status(404).json({
                error: "Authorization failed: user not found" 
            })
        }

        req.agent = decodeToken;
        next()

    }catch(error){

        // if(error instanceof jwt.JsonWebTokenError){
        //     return res.json({
        //         message: "session Timeout"
        //     })
        // }

        res.status(500).json({
            error:error.message
        })
    }
}



module.exports = authorization