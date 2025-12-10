// src/database/banco-mongo.ts
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI!;
if (!uri) {
  throw new Error('MONGO_URI não definido no .env');
}
const client = new MongoClient(uri);
await client.connect();
const dbName = process.env.MONGO_DB || 'Atividade';
const db = client.db(dbName);
console.log('MongoDB conectado no DB:', dbName);

export { db };
