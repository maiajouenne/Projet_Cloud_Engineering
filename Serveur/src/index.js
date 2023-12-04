import express from 'express';
import Kafka from 'kafkajs';

// Create an Express application
const app = express();

// Define the port for the Express application
const port = process.env.RECEIVE_PORT || 8080;

// Create the kafka app
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka1:9092', 'kafka2:9092'],
  })


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


// Start the Express application and listen on the specified port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
}); 