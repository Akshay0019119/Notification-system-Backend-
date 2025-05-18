const amqp = require('amqplib');
const mongoose = require('mongoose');
require('dotenv').config();

const Notification = require('./models/Notification');
const { sendEmail } = require('./services/emailService');
const { sendSMS } = require('./services/smsService');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Worker connected to MongoDB');

    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('notifications', { durable: true });

    console.log('🚀 Worker waiting for messages...');

    channel.consume('notifications', async (msg) => {
      if (msg !== null) {
        const { id } = JSON.parse(msg.content.toString());

        const notification = await Notification.findById(id);
        if (!notification) {
          console.log(`Notification ${id} not found`);
          channel.ack(msg);
          return;
        }

        try {
          let sent = false;

          if (notification.type === 'email') {
            sent = await sendEmail({
              to: 'recipient@example.com', // Replace with actual
              subject: notification.subject,
              message: notification.message,
            });
          } else if (notification.type === 'sms') {
            sent = await sendSMS({
              to: '1234567890', // Replace with actual
              message: notification.message,
            });
          } else if (notification.type === 'in-app') {
            sent = true;
          }

          notification.status = sent ? 'sent' : 'failed';
          await notification.save();

          if (sent) {
            channel.ack(msg);
            console.log(`✅ Notification ${id} sent and acknowledged`);
          } else {
            // Retry logic: requeue message up to 3 attempts
            notification.retryCount = (notification.retryCount || 0) + 1;
            await notification.save();

            if (notification.retryCount >= 3) {
              console.log(`❌ Notification ${id} failed after 3 attempts`);
              channel.ack(msg); // Drop message
            } else {
              console.log(`⚠️ Retrying notification ${id} (${notification.retryCount} attempts)`);
              channel.nack(msg, false, true); // Requeue message
            }
          }
        } catch (error) {
          console.error('Error processing notification:', error);
          channel.nack(msg, false, true); // Requeue on error
        }
      }
    }, { noAck: false });

  } catch (error) {
    console.error('Worker failed:', error);
  }
}

start();
