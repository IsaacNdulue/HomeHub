const joi = require('joi')

const validation = joi.object({
    fullName:joi.string().min(3).max(50),
    email: joi.string().email({ tlds: { allow: false } }).required().trim().messages({
              'string.empty': 'Email cannot be empty',
              'any.required': 'Email is required',
            }),
    phoneNumber: joi.string()
    .required()
    .pattern(/^[0-9]{11}$/)
    .message('Phone number must be exactly 11 digits')
    .messages({
      'string.empty': 'PhoneNumber cannot be empty',
      'any.required': 'PhoneNumber is required',
      'any.pattern.base': 'Invalid phone number',
      'string.length': 'Phone number must be exactly 11 digits'
    }),
  
    password:joi.string().pattern(new RegExp ('^[a-zA-Z0-9]{3,30}$')),
    // confirmPassword:joi.string().pattern(new RegExp ('^[a-zA-Z0-9]{3,30}$')),
    confirmPassword:joi.string().valid(joi.ref("password")).required()
})


module.exports = validation