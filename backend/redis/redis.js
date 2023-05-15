

const redis = require('redis');
const client = redis.createClient({
	url: "redis://default:XG1X8JdgAXJjA1b6gatlLshQZSTdAkK1@redis-18090.c100.us-east-1-4.ec2.cloud.redislabs.com:18090"
});

client.on('error', (err) => console.log(err.message));
(async () => await client.connect())()
client.on('ready', () => console.log('Redis client connected'));

module.exports = { client }

