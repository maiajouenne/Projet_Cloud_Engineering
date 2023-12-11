import { Kafka } from 'kafkajs';
import { MongoClient } from 'mongodb';

const kafka_adress = process.env.KAFKA_ADRESS || 'localhost:9094'

const kafka_id = process.env.KAFKA_ID || 'Consumer'

const kafka = new Kafka({
    clientId: kafka_id,
    brokers: [kafka_adress],
  });

const mongo_network = process.env.MONGO_NETWORK || 'localhost'

const mongo_host = process.env.MONGO_HOST|| '27017'

const mongo_adress = 'mongodb://' + mongo_network + ':' + mongo_host

const mongoClient = new MongoClient(mongo_adress);

await mongoClient.connect();

const consumer = kafka.consumer({ groupId: 'API-db' })

await consumer.connect()
await consumer.subscribe({ topic: ['Ticket-valide', 'Ticket-error']})

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    try {
        // Parse the message value (assuming it's a JSON string)
        const messageValue = JSON.parse(message.value.toString());

        // Save the message to MongoDB
        const db = mongoClient.db('your_database_name');
        const collection = db.collection(topic);

        await collection.insertOne({
            key: message.key ? message.key.toString() : null,
            value: messageValue,
            headers: message.headers,
        });
        console.log(messageValue)
        console.log(`Message saved to MongoDB for topic: ${topic}`);
    } catch (error) {
        console.error('Error processing Kafka message:', error);
    };

}});