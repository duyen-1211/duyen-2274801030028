const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const fs = require('fs');

const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'mongodb';
const collectionName = 'student';

const htmlPath = path.join(__dirname, 'pages');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(htmlPath, '/create.html'));
});

app.get('/', async (req, res) => {
    try {
        await client.connect();
        
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const students = await collection.find({}).toArray();
        
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close(); 
    }
});

app.post('/create', async (req, res) => {
  try {
      await client.connect();
      console.log('Connected to MongoDB successfully!');

      const students = req.body;

      console.log('Starting to add to the database...');

      const studentsCollection = client.db(dbName).collection(collectionName);

      await studentsCollection.insertMany(students);

      const content = `${students.length} students created successfully!`;

      res.json({ message: content });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
  } finally {
      if (client) {
          await client.close();
      }
      console.log('MongoDB connection has been closed');
  }
});
  
app.listen(port, () => console.log(`Server running at http://127.0.0.1:${port}/`));
