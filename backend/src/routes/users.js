import express from "express";
import { User } from "../sequelize.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { hashPassword, validateCPF } from "../services/authService.js";

const router = express.Router();

// Listar usuários (apenas admin)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "cpf",
        "nickname",
        "phone",
        "createdAt",
        "lastLogin",
        "isActive",
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Obter usuário por ID (admin ou próprio usuário)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se é admin ou o próprio usuário
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "cpf",
        "nickname",
        "phone",
        "createdAt",
        "lastLogin",
        "isActive",
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Criar usuário (apenas admin)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, cpf, nickname, phone, role = "member" } = req.body;

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Verificar se email já existe
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    // Validar CPF se fornecido
    if (cpf) {
      if (!validateCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
      }

      // Verificar se CPF já existe
      const existingCPF = await User.findOne({ where: { cpf } });
      if (existingCPF) {
        return res.status(409).json({ error: "CPF já cadastrado" });
      }
    }

    // Validar role
    if (!["member", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role deve ser 'member' ou 'admin'" });
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      cpf,
      nickname,
      phone,
      role,
    });

    // Retornar sem password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cpf: user.cpf,
      nickname: user.nickname,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Atualizar usuário (admin ou próprio usuário)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cpf, nickname, phone, role, isActive } = req.body;

    // Verificar permissões
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Apenas admin pode alterar role e status
    if (req.user.role !== "admin" && (role || isActive !== undefined)) {
      return res.status(403).json({ error: "Apenas administradores podem alterar role ou status" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Validações
    if (name && name.trim().length < 2) {
      return res.status(400).json({ error: "Nome deve ter pelo menos 2 caracteres" });
    }

    // Validar CPF se fornecido e diferente do atual
    if (cpf && cpf !== user.cpf) {
      if (!validateCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
      }

      // Verificar se CPF já existe em outro usuário
      const existingCPF = await User.findOne({
        where: { cpf },
      });
      if (existingCPF && existingCPF.id !== id) {
        return res.status(409).json({ error: "CPF já cadastrado por outro usuário" });
      }
    }

    // Validar role se fornecido
    if (role && !["member", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role deve ser 'member' ou 'admin'" });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined && req.user.role === "admin") updateData.role = role;
    if (isActive !== undefined && req.user.role === "admin") updateData.isActive = isActive;

    await user.update(updateData);

    res.json({
      message: "Usuário atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        nickname: user.nickname,
        phone: user.phone,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Alterar senha do usuário (próprio usuário ou admin)
router.put("/:id/password", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Verificar permissões
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Se não for admin, verificar senha atual
    if (req.user.role !== "admin") {
      if (!currentPassword) {
        return res.status(400).json({ error: "Senha atual é obrigatória" });
      }

      const { comparePassword } = await import("../services/authService.js");
      if (!comparePassword(currentPassword, user.passwordHash)) {
        return res.status(400).json({ error: "Senha atual incorreta" });
      }
    }

    // Validar nova senha
    const { validatePassword } = await import("../services/authService.js");
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Nova senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula e número"
      });
    }

    const { hashPassword } = await import("../services/authService.js");
    const hashedPassword = hashPassword(newPassword);

    await user.update({ passwordHash: hashedPassword });

    res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Desativar/reativar usuário (apenas admin)
router.put("/:id/toggle-status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Não permitir desativar o próprio usuário
    if (user.id === req.user.id) {
      return res.status(400).json({ error: "Não é possível desativar o próprio usuário" });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      message: `Usuário ${user.isActive ? "ativado" : "desativado"} com sucesso`,
      user: {
        id: user.id,
        name: user.name,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Excluir usuário (apenas admin)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Não permitir excluir o próprio usuário
    if (user.id === req.user.id) {
      return res.status(400).json({ error: "Não é possível excluir o próprio usuário" });
    }

    await user.destroy();

    res.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
