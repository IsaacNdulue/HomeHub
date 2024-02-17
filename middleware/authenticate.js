const agentModel = require("../Model/agentModel")
const jwt = require("jsonwebtoken")
require("dotenv").config()



const authenticate = async (req,res,next)=>{
    try{

        const hasAuthorization = req.headers.authorization

        if(!hasAuthorization){
            return res.status(400).json({
                error:"Authorization token not inputted"
            })
        }

        const token = hasAuthorization.split(" ")[1]

        if(!token){
            return res.status(400).json({
                error: "Authorization not found"
            })
        }

        const decodeToken = jwt.verify(token, process.env.jwtSecret)

        const agent = await agentModel.findById(decodeToken.userId)
        // console.log(agent)
        const check = agent.blackList.includes(token);

        if(check){
            return res.status(400).json({
                error: "agent logged Out"
            })
        }


        if(!agent){
            return res.status(404).json({
                error: "Authorization failed: not an agent" 
            })
        }

        req.user = decodeToken;
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



module.exports = authenticate