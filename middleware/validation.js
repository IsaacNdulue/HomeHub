const joi = require('joi')

const validation = joi.object({
    fullName:joi.string().min(3).max(50),
    email:joi.string().email().required(),
    // phoneNumber:joi.string().pattern(new RegExp('^[0-9]')).min(5).max(13),
    phoneNumber:joi.string(),
    password:joi.string().pattern(new RegExp ('^[a-zA-Z0-9]{3,30}$')),
    // confirmPassword:joi.string().pattern(new RegExp ('^[a-zA-Z0-9]{3,30}$')),
    confirmPassword:joi.string().valid(joi.ref("password")).required()
})


module.exports = validation