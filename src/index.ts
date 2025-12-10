// src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rotasNaoAuth from './rotas/rotas-nao-autenticadas.js';
import rotasAuth from './rotas/rotas-autenticadas.js';

const app = express();
app.use(cors());
app.use(express.json());

// rotas públicas
app.use('/', rotasNaoAuth);

// rotas autenticadas
app.use('/', rotasAuth);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
