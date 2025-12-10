// src/carrinho/carrinho.controller.ts
import { Request, Response } from 'express';
import { ObjectId } from 'bson';
import { db } from '../database/banco-mongo.js';

interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  nome: string;
}

interface Carrinho {
  usuarioId: string;
  itens: ItemCarrinho[];
  dataAtualizacao: Date;
  total: number;
}

interface AutenticacaoRequest extends Request {
  usuarioId?: string;
}

class CarrinhoController {
  async adicionarItem(req: AutenticacaoRequest, res: Response) {
    try {
      const usuarioId = req.usuarioId || req.body.usuarioId;
      const { produtoId, quantidade } = req.body;
      if (!usuarioId || !produtoId || quantidade === undefined) {
        return res.status(400).json({
          error: 'usuarioId, produtoId e quantidade são obrigatórios',
          mensagem: 'usuarioId, produtoId e quantidade são obrigatórios',
        });
      }
      let produtoObjectId;
      try {
        produtoObjectId = ObjectId.createFromHexString(produtoId);
      } catch {
        return res.status(400).json({ error: 'produtoId inválido', mensagem: 'produtoId inválido' });
      }
      const produtosCursor = db.collection('produtos').find({ _id: produtoObjectId });
      const produtosArray = await (produtosCursor.toArray ? produtosCursor.toArray() : produtosCursor);
      if (!produtosArray || produtosArray.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado', mensagem: 'Produto não encontrado' });
      }
      const produto = produtosArray[0];
      const precoUnitario = produto.preco;
      const nome = produto.nome;

      const carrinhosCursor = db.collection<Carrinho>('carrinhos').find({ usuarioId });
      const carrinhosArray = await (carrinhosCursor.toArray ? carrinhosCursor.toArray() : carrinhosCursor);

      if (!carrinhosArray || carrinhosArray.length === 0) {
        const novoCarrinho: Carrinho = {
          usuarioId,
          itens: [{ produtoId, quantidade, precoUnitario, nome }],
          dataAtualizacao: new Date(),
          total: precoUnitario * quantidade,
        };
        await db.collection('carrinhos').insertOne(novoCarrinho);
        return res.status(201).json(novoCarrinho);
      }

      const carrinho = carrinhosArray[0];
      const itemExistente = carrinho.itens.find((item) => item.produtoId === produtoId);
      if (itemExistente) {
        itemExistente.quantidade += quantidade;
      } else {
        carrinho.itens.push({ produtoId, quantidade, precoUnitario, nome });
      }
      carrinho.total = carrinho.itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0);
      carrinho.dataAtualizacao = new Date();
      await db.collection('carrinhos').updateOne(
        { usuarioId },
        { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
      );
      return res.status(200).json(carrinho);
    } catch (err) {
      console.error('Erro adicionarItem:', err);
      return res.status(500).json({ error: 'Erro interno', mensagem: 'Erro interno' });
    }
  }

  async removerItem(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuarioId || req.body.usuarioId;
      const { produtoId } = req.body;
      if (!usuarioId || !produtoId) return res.status(400).json({ error: 'usuarioId e produtoId são obrigatórios', mensagem: 'usuarioId e produtoId são obrigatórios' });

      const carrinho = await db.collection<Carrinho>('carrinhos').findOne({ usuarioId });
      if (!carrinho) return res.status(404).json({ error: 'Carrinho não encontrado', mensagem: 'Carrinho não encontrado' });

      const itemIndex = carrinho.itens.findIndex((item) => item.produtoId === produtoId);
      if (itemIndex === -1) return res.status(404).json({ error: 'Item não encontrado no carrinho', mensagem: 'Item não encontrado no carrinho' });

      carrinho.itens.splice(itemIndex, 1);
      carrinho.total = carrinho.itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0);
      carrinho.dataAtualizacao = new Date();
      await db.collection('carrinhos').updateOne(
        { usuarioId },
        { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
      );
      return res.status(200).json(carrinho);
    } catch (err) {
      console.error('Erro removerItem:', err);
      return res.status(500).json({ error: 'Erro interno', mensagem: 'Erro interno' });
    }
  }

  async atualizarQuantidade(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuarioId || req.body.usuarioId;
      const { produtoId, quantidade } = req.body;
      if (!usuarioId || !produtoId || quantidade === undefined) return res.status(400).json({ error: 'usuarioId, produtoId e quantidade são obrigatórios', mensagem: 'usuarioId, produtoId e quantidade são obrigatórios' });
      if (quantidade <= 0) return res.status(400).json({ error: 'Quantidade deve ser maior que zero', mensagem: 'Quantidade deve ser maior que zero' });

      const carrinho = await db.collection<Carrinho>('carrinhos').findOne({ usuarioId });
      if (!carrinho) return res.status(404).json({ error: 'Carrinho não encontrado', mensagem: 'Carrinho não encontrado' });

      const item = carrinho.itens.find((i) => i.produtoId === produtoId);
      if (!item) return res.status(404).json({ error: 'Item não encontrado no carrinho', mensagem: 'Item não encontrado no carrinho' });

      item.quantidade = quantidade;
      carrinho.total = carrinho.itens.reduce((acc, it) => acc + it.precoUnitario * it.quantidade, 0);
      carrinho.dataAtualizacao = new Date();

      await db.collection('carrinhos').updateOne(
        { usuarioId },
        { $set: { itens: carrinho.itens, total: carrinho.total, dataAtualizacao: carrinho.dataAtualizacao } }
      );
      return res.status(200).json(carrinho);
    } catch (err) {
      console.error('Erro atualizarQuantidade:', err);
      return res.status(500).json({ error: 'Erro interno', mensagem: 'Erro interno' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = req.params.usuarioId;
      if (!usuarioId || typeof usuarioId !== 'string') return res.status(400).json({ error: 'usuarioId é obrigatório e deve ser uma string', mensagem: 'usuarioId é obrigatório e deve ser uma string' });
      const carrinho = await db.collection<Carrinho>('carrinhos').findOne({ usuarioId });
      if (!carrinho) return res.status(404).json({ error: 'Carrinho não encontrado', mensagem: 'Carrinho não encontrado' });
      return res.status(200).json(carrinho);
    } catch (err) {
      console.error('Erro listar carrinho:', err);
      return res.status(500).json({ error: 'Erro interno', mensagem: 'Erro interno' });
    }
  }

  async remover(req: Request, res: Response) {
    try {
      const usuarioId = req.params.usuarioId;
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId é obrigatório', mensagem: 'usuarioId é obrigatório' });
      const resultado = await db.collection('carrinhos').deleteOne({ usuarioId });
      if (resultado.deletedCount === 0) return res.status(404).json({ error: 'Carrinho não encontrado', mensagem: 'Carrinho não encontrado' });
      return res.status(200).json({ mensagem: 'Carrinho removido com sucesso' });
    } catch (err) {
      console.error('Erro remover carrinho:', err);
      return res.status(500).json({ error: 'Erro interno', mensagem: 'Erro interno' });
    }
  }
}

export default new CarrinhoController();
