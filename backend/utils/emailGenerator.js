const nodemailer = require('nodemailer');
require("dotenv").config();


const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

async function sendEmail(to,subject,html){
    await transporter.sendMail({
        from:`"Split_EX <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    })
}

module.exports = sendEmail;