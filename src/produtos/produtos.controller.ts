// src/produtos/produtos.controller.ts
import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';
import { ObjectId } from 'bson';

class ProdutosController {
  async adicionar(req: Request, res: Response) {
    try {
      const { nome, preco, urlfoto, descricao, category } = req.body;
      if (!nome || preco === undefined || !urlfoto || !descricao) {
        return res.status(400).json({ error: 'Nome, preço, urlfoto e descrição são obrigatórios' });
      }
      const produto = { nome, preco: Number(preco), urlfoto, descricao, category: category || 'Geral' };
      const resultado = await db.collection('produtos').insertOne(produto);
      res.status(201).json({ ...produto, _id: resultado.insertedId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro interno' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { q, category } = req.query;
      const filter: any = {};
      if (q && typeof q === 'string') filter.nome = { $regex: q, $options: 'i' };
      if (category && typeof category === 'string') filter.category = category;
      const produtos = await db.collection('produtos').find(filter).toArray();
      res.status(200).json(produtos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro interno' });
    }
  }
}

export default new ProdutosController();
