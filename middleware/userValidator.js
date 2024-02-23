//userValidator
const Joi = require("@hapi/Joi");

const userValidation = (data) => {
    try {
        const validateUser = Joi.object({
            fullName: Joi.string().required().max(40).
            regex(/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/).messages({
                'string.empty': 'fullName cannot be empty',
                'any.pattern.base': 'fullName should only contain letters',
                'any.required': 'fullName is required'
              }),
            // email: Joi.string().email({ tlds: { allow: false } }).required().trim().messages({
            //   'string.empty': 'Email cannot be empty',
            //   'any.required': 'Email is required',
            // }),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().required().pattern(/^[0-9]{11}$/).message('Phone number must be exactly 11 digits'),
            // .messages({
            //     'string.empty': 'PhoneNumber cannot be empty',
            //     'any.required': 'PhoneNumber is required',
            //     'any.pattern.base': 'Invalid phone number',
            //     'string.length': 'Phone number can not be less than or greater than 11 digit'
              //}),
            password: Joi.string().min(6).required(),
            // pattern(/^(?=.\d)(?=.[a-z])(?=.[A-Z])(?=.[\W_]).{8,}$/).messages({
            //   'string.empty': 'Password cannot be empty',
            //   'string.min': 'Minimum 8 characters required',
            //   'any.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long',
            //   'any.required': 'Password is required'
            // }),
            
            confirmPassword: Joi.string().valid(Joi.ref("password")).required()
            // .pattern(/^(?=.\d)(?=.[a-z])(?=.[A-Z])(?=.[\W_]).{8,}$/).messages({
            //   'string.empty': 'Password cannot be empty',
            //   'string.min': 'Minimum 8 characters required',
            //   'any.pattern.base': 'Password should contain letters, numbers, and special characters',
            //   'any.required': 'confirmPassword is required',
            })
        //     .valid(Joi.ref('password'))
        //         .messages({ 'any.only': 'Confirm Password must match Password' }),
        
        //   })
          return  validateUser.validate(data);

    } catch (error) {
        message: "validator error: " +error.message
        
    }
}

module.exports = {userValidation};