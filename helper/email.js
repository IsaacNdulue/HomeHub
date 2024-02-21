
const nodemailer = require ('nodemailer');
 require('dotenv').config()
const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
    
    host: prcess.env.service,
    service : "gmail" ,
    port: 587,
    secure:true,

    auth:{
        user : process.env.user,
        pass : process.env.mailPassword,
        
    },
    })


    let mailOption = { 
        from : process.env.user,
        to: options.email,
        subject:options.subject,
        html: options.html
    }
    await transporter.sendMail(mailOption)
    console.log('Message sent')
}

module.exports = sendEmail