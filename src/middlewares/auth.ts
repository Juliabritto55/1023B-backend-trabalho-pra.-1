// src/middlewares/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AutenticacaoRequest extends Request {
  usuarioId?: string;
  nome?: string;
  role?: string;
}

export default function Auth(req: AutenticacaoRequest, res: Response, next: NextFunction) {
  try {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) return res.status(401).json({ mensagem: 'Você não passou o token no Bearer' });
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        console.log('JWT verify error', err);
        return res.status(401).json({ mensagem: 'Middleware erro token' });
      }
      if (!decoded || typeof decoded === 'string') {
        return res.status(401).json({ mensagem: 'Middleware erro decoded' });
      }
      // @ts-ignore
      req.usuarioId = decoded.usuarioId;
      // @ts-ignore
      req.nome = decoded.nome;
      // @ts-ignore
      req.role = decoded.role;
      next();
    });
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(500).json({ mensagem: 'Erro no middleware' });
  }
}
