import express from 'express';
import { Kafka, Partitioners } from 'kafkajs';


// Create an Express application
const app = express();

// Define the port for the Express application
const port = process.env.RECEIVE_PORT || 8080;

// Create the kafka app

// Create the kafka app
const kafka = new Kafka({
    clientId: 'Serveur',
    brokers: ['localhost:9094'],
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
        return obj.articles.every(article => checkKeys(article, articleKeys));
    } else {
        return false;
    };
  }

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());

app.get('/', async (req, res) => {
    res.send("hello world!")
});

app.post('/', async (req, res) => {
    
    // If the object keys match the required keys, update Redis data
    if (areKeysMatching(req.body)) {

        await producer.connect();
        
        await producer.send({
        topic: 'Ticket-valide',
        messages: [
            { value: req.body},
            ],
        })

        await producer.disconnect();

        res.send('Ticket successfuly saved');
    
    } else {
        
        await producer.connect();
        
        await producer.send({
        topic: 'Ticket-error',
        messages: [
            { value: req.body},
            ],
        });

        await producer.disconnect();
        
        res.send('Error in the ticket');

    }
})


// Start the Express application and listen on the specified port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
}); 