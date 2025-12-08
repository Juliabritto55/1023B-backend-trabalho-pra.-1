// src/rotas/rotas-autenticadas.ts
import { Router } from "express";
import Auth from "../middlewares/auth.js";
import carrinhoController from "../carrinho/carrinho.controller.js";
import produtosController from "../produtos/produtos.controller.js";

const rotas = Router();

// aplica autenticação a todas as rotas abaixo
rotas.use(Auth);

// somente autenticação permitida aqui
rotas.post("/produtos", produtosController.adicionar);

rotas.post("/adicionarItem", carrinhoController.adicionarItem);
rotas.post("/removerItem", carrinhoController.removerItem);
rotas.put("/atualizarQuantidade", carrinhoController.atualizarQuantidade);
rotas.get("/carrinho/:usuarioId", carrinhoController.listar);
rotas.delete("/carrinho/:usuarioId", carrinhoController.remover);

export default rotas;
