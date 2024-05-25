const agentModel = require("../Model/agentModel")
const jwt = require("jsonwebtoken")
require("dotenv").config()



// const authenticate = async (req,res,next)=>{
//     try{

//         const hasAuthorization = req.headers.authorization

//         if(!hasAuthorization){
//             return res.status(400).json({
//                 error:"Authorization token not inputted"
//             })
//         }

//         const token = hasAuthorization.split(" ")[1]

//         if(!token){
//             return res.status(400).json({
//                 error: "Authorization not found"
//             })
//         }

//         const decodeToken = jwt.verify(token, process.env.jwtSecret)

//         const agent = await agentModel.findById(decodeToken.userId)
//         // console.log(agent)
//         const check = agent.blackList.includes(token);

//         if(check){
//             return res.status(400).json({
//                 error: "agent logged Out"
//             })
//         }


//         if(!agent){
//             return res.status(404).json({
//                 error: "Authorization failed: not an agent" 
//             })
//         }

//         req.user = decodeToken;
//         next()

//     }catch(error){

//         // if(error instanceof jwt.JsonWebTokenError){
//         //     return res.json({
//         //         message: "session Timeout"
//         //     })
//         // }

//         res.status(500).json({
//             error:error.message
//         })
//     }
// }


const authenticateAdmin = async (req, res, next) => {
    try {
      // Extract the token from the request headers
      const hasAuthorization = req.headers.authorization;
  
      if (!hasAuthorization) {
        return res.status(401).json({ error: 'Authorization token is required' });
      }
  
      // Split the authorization header to get the token
      const token = hasAuthorization.split(" ")[1];
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.jwtSecret);
  
      // Check if the agent exists and has admin role
      const agent = await agentModel.findById(decoded.agentId);
  
      if (!agent) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
      if (agent.isAdmin === false) {
        return res.status(403).json({ error: 'Unauthorized access, must be an admin' });
      }
  
      req.user = decoded; // Attach the user object to the request for further use
      next();
    } catch (error) {
      if(error instanceof jwt.JsonWebTokenError){
              return res.json({
                  message: "session Timeout"
              })
          }
      return res.status(401).json({ error:error.message });
    }
};


module.exports = {
    authenticateAdmin
}