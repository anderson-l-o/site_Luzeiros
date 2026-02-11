import jwt from "jsonwebtoken";
import { User } from "../sequelize.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token de autenticação ausente" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "change_this_secret"
    );

    // Verificar se o usuário ainda existe e está ativo
    const user = await User.findByPk(payload.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Usuário não encontrado ou conta desativada" });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expirado. Faça login novamente." });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    } else {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Erro interno de autenticação" });
    }
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Autenticação necessária" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }

  next();
}

// Middleware opcional para verificar sessão recente
export async function requireRecentSession(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Autenticação necessária" });
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(401).json({ error: "Usuário não encontrado" });
  }

  // Verificar se o último login foi há menos de 24 horas (configurável)
  const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas
  if (user.lastLogin && (Date.now() - user.lastLogin.getTime()) > maxSessionAge) {
    return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
  }

  next();
}
