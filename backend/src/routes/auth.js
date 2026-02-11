import express from "express";
import { User } from "../sequelize.js";
import { Op } from "sequelize";
import {
  hashPassword,
  comparePassword,
  createToken,
  generateResetToken,
  hashResetToken,
  validatePassword,
  validateCPF,
} from "../services/authService.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// Registro de usuário
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, cpf, nickname, phone } = req.body;

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula e número"
      });
    }

    if (cpf && !validateCPF(cpf)) {
      return res.status(400).json({ error: "CPF inválido" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      cpf,
      nickname,
      phone,
    });

    const token = createToken(user);
    res.status(201).json({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Login com validação de conta ativa
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Conta desativada" });
    }

    if (!comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Atualizar último login
    await user.update({ lastLogin: new Date() });

    const token = createToken(user);
    res.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Solicitar recuperação de senha
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Não revelar se o email existe ou não por segurança
      return res.json({ message: "Se o email existir, você receberá instruções de recuperação" });
    }

    // Gerar token de reset
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await user.update({
      resetToken: hashedToken,
      resetExpires,
    });

    // TODO: Enviar email com o token
    // Por enquanto, apenas retornamos o token para desenvolvimento
    console.log(`Reset token para ${email}: ${resetToken}`);

    res.json({
      message: "Instruções de recuperação enviadas para seu email",
      // Remover em produção - apenas para desenvolvimento
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Resetar senha
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token e nova senha são obrigatórios" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Nova senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula e número"
      });
    }

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
      where: {
        resetToken: hashedToken,
        resetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const passwordHash = hashPassword(newPassword);
    await user.update({
      passwordHash,
      resetToken: null,
      resetExpires: null,
    });

    res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Logout (invalidar token no frontend)
router.post("/logout", async (req, res) => {
  try {
    // Em uma implementação mais avançada, poderíamos manter uma lista de tokens inválidos
    // Por enquanto, apenas confirmamos o logout
    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Verificar status da sessão
router.get("/me", requireAuth, async (req, res) => {
  try {
    // Este endpoint será protegido pelo middleware requireAuth
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'cpf', 'nickname', 'phone', 'lastLogin', 'isActive'],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        nickname: user.nickname,
        phone: user.phone,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
