// src/rotas/rotas-autenticadas.ts
import { Router } from 'express';
import Auth from '../middlewares/auth.js';
import adminOnly from '../middlewares/adminOnly.js';
import carrinhoController from '../carrinho/carrinho.controller.js';
import produtosController from '../produtos/produtos.controller.js';

const rotas = Router();
rotas.use(Auth);

// rotas admin protegidas
rotas.post('/produtos', adminOnly, produtosController.adicionar);

// carrinho
rotas.post('/adicionarItem', carrinhoController.adicionarItem);
rotas.post('/removerItem', carrinhoController.removerItem);
rotas.put('/atualizarQuantidade', carrinhoController.atualizarQuantidade);
rotas.get('/carrinho/:usuarioId', carrinhoController.listar);
rotas.delete('/carrinho/:usuarioId', carrinhoController.remover);

export default rotas;
