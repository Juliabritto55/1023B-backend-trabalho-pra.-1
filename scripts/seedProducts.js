// scripts/seedProducts.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || 'Atividade';

const produtos = [
  { nome: "Mousepad Ergonômico com Apoio de Pulso", preco: 49.90, category: "Acessórios", descricao: "Apoio em gel para conforto.", urlfoto: "https://placehold.co/400x300?text=Mousepad" },
  { nome: "Suporte Ajustável para Monitor", preco: 129.90, category: "Suportes", descricao: "Elevador metálico com ajuste de altura.", urlfoto: "https://placehold.co/400x300?text=Suporte+Monitor" },
  { nome: "Luz LED Regulável para Home Office", preco: 79.90, category: "Iluminação", descricao: "3 temperaturas de cor e dimmer.", urlfoto: "https://placehold.co/400x300?text=Luz+LED" },
  { nome: "Organizador de Mesa Modular", preco: 39.90, category: "Organização", descricao: "Compartimentos para cabos e canetas.", urlfoto: "https://placehold.co/400x300?text=Organizador" }
];

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  await db.collection('produtos').deleteMany({});
  await db.collection('produtos').insertMany(produtos);
  console.log('Seed concluído');
  await client.close();
}
run().catch(console.error);
