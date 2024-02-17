const nodemailer =require ('nodemailer')

const dotenv = require('dotenv').config()
const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
    service : process.env.service,
    auth:{
        user : process.env.user,
        pass : process.env.mailPassword,
        secure:false
    }
    })


    let mailOption = { 
        from : process.env.user,
        to: options.email,
        subject:options.subject,
        html: options.html
    }
    await transporter.sendMail(mailOption)
}

module.exports = sendEmail
