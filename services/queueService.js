const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let channel;

async function connect() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('notifications', { durable: true });
    console.log('✅ Connected to RabbitMQ and queue asserted');
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ', error);
  }
}

// Send message to queue
async function sendToQueue(notification) {
  if (!channel) {
    await connect();
  }
  channel.sendToQueue('notifications', Buffer.from(JSON.stringify(notification)), {
    persistent: true,
  });
  console.log('📤 Notification sent to queue');
}

module.exports = {
  sendToQueue,
  connect,
};
