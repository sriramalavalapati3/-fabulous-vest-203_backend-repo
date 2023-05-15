const amqp = require('amqplib');

const url = 'amqp://localhost';
const queueName = 'messages';

async function connect() {
  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName);

    console.log(`Connected to RabbitMQ server at ${url}`);

    return channel;
  } catch (error) {
    console.error(error);
  }
}

const channel = await connect();

async function consumeMessages() {
    const options = { noAck: true };
  
    channel.consume(queueName, (message) => {
      const content = message.content.toString();
  
      console.log(`Consumed message: ${content}`);
    }, options);
  }
  
  await consumeMessages();
  
