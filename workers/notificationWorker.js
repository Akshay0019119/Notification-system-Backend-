const amqp = require('amqplib');
const mongoose = require('mongoose');
const Notification = require('../models/NotificationModel');

// const sendEmail = require('../services/emailService');
// const sendSMS = require('../services/smsService');

mongoose.connect('mongodb://localhost:27017/notification-db');

const processNotification = async (data) => {
  const { notificationId } = JSON.parse(data);
  const notification = await Notification.findById(notificationId);

  if (!notification || notification.status === 'sent') return;

  try {
    let sent = false;

    if (notification.type === 'email') {
      // sent = await sendEmail(notification.to, notification.subject, notification.message);
      sent = true;
    } else if (notification.type === 'sms') {
      // sent = await sendSMS(notification.to, notification.message);
      sent = true;
    } else if (notification.type === 'in-app') {
      sent = true;
    }

    if (sent) {
      notification.status = 'sent';
    } else {
      notification.status = 'failed';
      notification.retryCount += 1;
    }

    await notification.save();

    // Retry if failed & retryCount < 3
    if (!sent && notification.retryCount < 3) {
      setTimeout(() => publishToQueue({ notificationId }), 3000);
    }

  } catch (err) {
    console.error('Worker Error:', err);
  }
};

const publishToQueue = async (data) => {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  ch.assertQueue('notificationQueue', { durable: true });
  ch.sendToQueue('notificationQueue', Buffer.from(JSON.stringify(data)), {
    persistent: true
  });
};

(async () => {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue('notificationQueue', { durable: true });

  ch.consume('notificationQueue', async (msg) => {
    if (msg !== null) {
      await processNotification(msg.content.toString());
      ch.ack(msg);
    }
  });

  console.log('📥 Worker is listening to queue...');
})();
