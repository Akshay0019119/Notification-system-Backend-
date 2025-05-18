const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log('SMS sent successfully');
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};

module.exports = sendSMS;
