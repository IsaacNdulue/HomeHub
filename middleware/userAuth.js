//userAuthentication
const jwt = require('jsonwebtoken');
const userModel = require('../Model/userModel')
require('dotenv').config();

const authenticate = async(req,res, next)=>{
    try {
        const hasAuthorization = req.headers.authorization
        if(!hasAuthorization){
            return res.status(404).json('User not authorized')
        }
        const token = hasAuthorization.split(" ")[1];
        if(!token){
            return res.status(404).json('Token not found')
        }
        const decodeToken = jwt.verify(token, process.env.jwtSecret)
        const user = await userModel.findById(decodeToken.userId)
        if(!user){
            return res.status(404).json('User not found')
        }
        
        req.user=decodeToken

        next()
    } catch (error) {
        return res.status(500).json({
            Error: "error authenticating: " +error.message,
        })
    }

}

module.exports = {authenticate}