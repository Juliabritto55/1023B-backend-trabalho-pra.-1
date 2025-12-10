// src/usuarios/usuarios.controller.ts
import { Request, Response } from 'express';
import { db } from '../database/banco-mongo.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class UsuariosController {
  async adicionar(req: Request, res: Response) {
    try {
      const { nome, idade, email, senha, role } = req.body;
      if (!nome || !idade || !email || !senha)
        return res.status(400).json({ error: 'Nome, idade, email e senha são obrigatórios' });
      if (senha.length < 6) return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
      if (!email.includes('@') || !email.includes('.')) return res.status(400).json({ error: 'Email inválido' });

      const existing = await db.collection('usuarios').findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email já cadastrado' });

      const senhaCriptografada = await bcrypt.hash(senha, 10);
      const usuario = { nome, idade, email, senha: senhaCriptografada, role: role || 'USER' };
      const resultado = await db.collection('usuarios').insertOne(usuario);
      res.status(201).json({ nome, idade, email, role: usuario.role, _id: resultado.insertedId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro interno' });
    }
  }

  async listar(req: Request, res: Response) {
    const usuarios = await db.collection('usuarios').find().toArray();
    const usuariosSemSenha = usuarios.map(({ senha, ...resto }) => resto);
    res.status(200).json(usuariosSemSenha);
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) return res.status(400).json({ mensagem: 'Email e senha são obrigatórios!' });

      const usuario: any = await db.collection('usuarios').findOne({ email });
      if (!usuario) return res.status(401).json({ mensagem: 'Usuário Incorreto!' });

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) return res.status(401).json({ mensagem: 'Senha Incorreta!' });

      const token = jwt.sign(
        { usuarioId: usuario._id.toString(), nome: usuario.nome, role: usuario.role || 'USER' },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
      );
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensagem: 'Erro interno' });
    }
  }
}

export default new UsuariosController();
