const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendEmail = async ({ to, subject, message }) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text: message
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', result.response);
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error);
    return false;
  }
};
