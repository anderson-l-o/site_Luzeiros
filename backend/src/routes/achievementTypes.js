import express from "express";
import { AchievementType } from "../sequelize.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
const router = express.Router();

router.get("/", async (_req, res) => {
  const types = await AchievementType.findAll({ order: [["name", "ASC"]] });
  res.json(types);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, description, points = 0, active = true } = req.body;
  if (!name) return res.status(400).json({ error: "Nome obrigatório" });
  const t = await AchievementType.create({ name, description, points, active });
  res.status(201).json(t);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const t = await AchievementType.findByPk(req.params.id);
  if (!t) return res.status(404).json({ error: "Tipo não encontrado" });
  await t.destroy();
  res.status(204).end();
});

export default router;
