import express from "express";
import { Achievement, AchievementType, User } from "../sequelize.js";
import { requireAuth } from "../middlewares/auth.js";
const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { userId } = req.query;
  const where = {};
  if (userId) where.userId = userId;
  const rows = await Achievement.findAll({
    where,
    include: [AchievementType, User],
    order: [["dateAchieved", "DESC"]],
  });
  res.json(rows);
});

router.post("/", requireAuth, async (req, res) => {
  const { userId, achievementTypeId, dateAchieved, notes } = req.body;
  if (!userId || !achievementTypeId || !dateAchieved)
    return res.status(400).json({ error: "Campos obrigatórios" });
  const a = await Achievement.create({
    userId,
    achievementTypeId,
    dateAchieved,
    notes,
  });
  res.status(201).json(a);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const a = await Achievement.findByPk(req.params.id);
  if (!a) return res.status(404).json({ error: "Registro não encontrado" });
  await a.destroy();
  res.status(204).end();
});

export default router;
