import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = "mongodb+srv://tvhoaihcmus:hcdmanme@cluster0.doeyhlt.mongodb.net/";
const client = new MongoClient(uri);

const filePath = path.join(__dirname, '..', 'src', 'new_words.json');

async function seed() {
  try {
    await client.connect();
    const database = client.db('new-words');
    const words = database.collection('words');

    // Clear existing data
    await words.deleteMany({});

    const data = fs.readFileSync(filePath, 'utf8');
    const vocabularyData = JSON.parse(data);

    const result = await words.insertMany(vocabularyData);
    console.log(`${result.insertedCount} documents were inserted`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();