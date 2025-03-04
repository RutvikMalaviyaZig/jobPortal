const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "90264eb632827a",
        pass: "c0bec5345016ce"
    }
});
const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: '"Job Portal" <noreply@jobportal.com>',
        to,
        subject,
        text
    });
};
module.exports = sendEmail;