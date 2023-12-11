import express from 'express';
import { Kafka, Partitioners } from 'kafkajs';
import bodyParser from 'body-parser'; // Middleware for parsing JSON requests


// Create an Express application
const app = express();

// Define the port for the Express application
const port = process.env.RECEIVE_PORT || 8080;

// Define the kafka id
const kafka_id = process.env.KAFKA_ID || 'localhost:9094'

// Create the kafka app

// Create the kafka app
const kafka = new Kafka({
    clientId: 'Serveur',
    brokers: [kafka_id],
  });


const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

// Function to check if keys are present in the object
function checkKeys(obj) {
    // Define the expected keys for each level
    const topLevelKeys = ["magasin", "numero_caisse", "nom_vendeur", "articles", "total"];
    const articleKeys = ["nom", "prix", "quantite"];
  
    // Check top-level keys
    if (topLevelKeys.every(key => Object.keys(obj).includes(key))) {
        return obj.articles.every(article => articleKeys.every(key => Object.keys(article).includes(key)));
    } else {
        return false;
    };
  };

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());

app.get('/', async (req, res) => {
    res.send("Server says hello !")
});

app.post('/', async (req, res) => {
    
    let messageValue = JSON.stringify(req.body);

    // If the object keys match the required keys, post the data
    if (checkKeys(req.body)) {

        await producer.connect();
        
        await producer.send({
        topic: 'Ticket-valide',
        messages: [
            { value: messageValue},
            ],
        })

        await producer.disconnect();

        console.log('Succesfuly passed a ticket')
        res.send(`Ticket successfuly saved\n`);
    
    } else {
        
        await producer.connect();
        
        await producer.send({
        topic: 'Ticket-error',
        messages: [
            { value: messageValue},
            ],
        });

        await producer.disconnect();
        
        console.log('Error in the ticket not passed')
        res.send(`Error in the ticket\n`);
    }
})


// Start the Express application and listen on the specified port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
}); 