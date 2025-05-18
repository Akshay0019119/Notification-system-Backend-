const Notification = require('../models/notificationModel');
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'notifications';

let channel;

// Initialize RabbitMQ connection & channel once
async function initRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('✅ RabbitMQ connected and queue asserted');
  } catch (err) {
    console.error('❌ RabbitMQ connection error:', err);
  }
}

// Call once on startup
initRabbitMQ();

const sendNotification = async (req, res) => {
  const { userId, type, to, subject, message } = req.body;

  if (!userId || !type || !message || (type !== 'in-app' && !to)) {
    return res.status(400).json({ 
      error: 'Missing required fields: userId, type, message, or recipient (to) for non in-app notifications' 
    });
  }

  try {
    const notification = new Notification({
      userId,
      type,
      subject,
      message,
      status: 'pending',
      retryCount: 0,
      to,
    });

    await notification.save();

    // Publish notification ID to RabbitMQ queue
    if (!channel) {
      return res.status(500).json({ error: 'Notification service temporarily unavailable' });
    }
    const msgPayload = JSON.stringify({ notificationId: notification._id });
    channel.sendToQueue(QUEUE_NAME, Buffer.from(msgPayload), { persistent: true });

    return res.status(202).json({
      status: 'queued',
      message: 'Notification queued for processing',
      data: notification,
    });
  } catch (error) {
    console.error('Error saving or queueing notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserNotifications = async (req, res) => {
  const userId = req.params.id;

  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ userId, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { sendNotification, getUserNotifications };
