require('dotenv').config()
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: process.env.MAIL_FROM_EMAIL,
        to,
        subject,
        text
    });
};
module.exports = sendEmail;