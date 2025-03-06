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
/**
 * Send Bulk Email
 * @param {Array} emails - List of email addresses to send to.
 * @param {String} subject - Subject of the email.
 * @param {String} text - Body of the email.
 */
const sendBulkEmail = (emails, subject, text) => {
    const mailOptions = {
      from: process.env.MAIL_FORM_EMAIL,   // Your email address
      to: emails.join(','),             // Multiple email addresses, separated by commas
      subject: subject,
      text: text
    };
  
    // Send email using the transporter
    return transporter.sendMail(mailOptions);
  };
  
  module.exports = sendBulkEmail;