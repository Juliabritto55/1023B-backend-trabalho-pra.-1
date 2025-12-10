// src/middlewares/adminOnly.ts
import { Request, Response, NextFunction } from "express";

interface AutenticacaoRequest extends Request {
  role?: string;
}

export default function adminOnly(
  req: AutenticacaoRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.role) {
    return res.status(401).json({ mensagem: "Token inválido" });
  }

  if (req.role !== "ADMIN") {
    return res.status(403).json({ mensagem: "Acesso negado: ADMIN somente" });
  }

  next();
}
