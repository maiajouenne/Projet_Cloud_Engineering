import { Kafka } from 'kafkajs';

const kafka_adress = process.env.KAFKA_ADRESS || 'localhost:9094'

const kafka_id = process.env.KAFKA_ID || 'Consumer'

const kafka = new Kafka({
    clientId: kafka_id,
    brokers: [kafka_adress],
  });

const consumer = kafka.consumer({ groupId: 'API-db' })

await consumer.connect()
await consumer.subscribe({ topic: 'Ticket-valide', fromBeginning: true })

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log({
        key: message.key ? message.key.toString() : null,
        value: message.value ? message.value.toString() : null,
        headers: message.headers,
    });
}})