const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue('notificationQueue', { durable: true });
  console.log('✅ Connected to RabbitMQ');
};

const publishToQueue = async (data) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  channel.sendToQueue('notificationQueue', Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};

module.exports = { connectRabbitMQ, publishToQueue };
