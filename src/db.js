import { MongoClient } from 'mongodb';

const url = process.env.DB_URL;
const client = new MongoClient(url);
const dbName = 'community';
export let db;
export let counter;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db(dbName);
    counter = await db.collection('counter').findOne({ name: 'counter' });
    if (!counter) {
      await db.collection('counter').insertOne({ count: 0, name: 'counter' });
      counter = await db.collection('counter').findOne({ name: 'counter' });
    }
    console.log(`💚 DB is connected to Monog Server`);
  } catch (error) {
    console.log(error);
  }
};
