import express from "express";
import { User } from "../sequelize.js";
import {
  hashPassword,
  comparePassword,
  createToken,
} from "../services/authService.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Dados incompletos" });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email já cadastrado" });
    const passwordHash = hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    const token = createToken(
      user,
      process.env.JWT_SECRET || "change_this_secret"
    );
    res.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (e) {
    console.error("Register error", e);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    if (!comparePassword(password, user.passwordHash))
      return res.status(401).json({ error: "Credenciais inválidas" });
    const token = createToken(
      user,
      process.env.JWT_SECRET || "change_this_secret"
    );
    res.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (e) {
    console.error("Login error", e);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

export default router;
