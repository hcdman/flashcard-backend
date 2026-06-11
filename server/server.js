import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import multer from 'multer';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    const database = client.db('new-words');

    app.get('/api/collections', async (req, res) => {
      const collections = await database.listCollections().toArray();
      res.json(collections.map(c => c.name));
    });

    app.get('/api/words/:collectionName', async (req, res) => {
      const { collectionName } = req.params;
      const words = database.collection(collectionName);
      const allWords = await words.find({}).toArray();
      res.json(allWords);
    });

    app.post('/api/upload', upload.single('file'), async (req, res) => {
      const { collectionName } = req.body;
      
      if (!req.file || !collectionName) {
        return res.status(400).send('Collection name and file are required.');
      }

      try {
        const wordsData = JSON.parse(req.file.buffer.toString('utf8'));
        const newCollection = database.collection(collectionName);
        await newCollection.insertMany(wordsData);
        res.status(201).send({ message: `Collection '${collectionName}' created successfully.` });
      } catch (parseErr) {
        res.status(400).send('Invalid JSON file.');
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);