const joi = require('joi')

const validation = joi.object({
    fullName: joi.string().required().min(3).max(100)
    .regex(/^[a-zA-Z\s]*$/, 'letters and spaces only')
    .messages({
      'string.base': 'Full name must be a string',
      'string.empty': 'Full name cannot be empty',
      'string.min': 'Full name must have at least {#limit} characters',
      'string.max': 'Full name must have at most {#limit} characters',
      'string.pattern.base': 'Full name must contain letters and spaces only'
    }),
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