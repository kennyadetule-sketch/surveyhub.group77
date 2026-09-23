const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error("Email sending failed");
  }
};

module.exports = { sendEmail };