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

  // Validação de data: não permitir datas futuras
  const d = new Date(dateAchieved);
  if (Number.isNaN(d.getTime())) return res.status(400).json({ error: "Data inválida" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(d);
  check.setHours(0, 0, 0, 0);
  if (check > today) return res.status(400).json({ error: "Data não pode ser futura" });

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
  // Permitir exclusão apenas pelo dono ou admin
  if (req.user.role !== "admin" && req.user.id !== a.userId) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  await a.destroy();
  res.status(204).end();
});

// Atualizar conquista (owner ou admin)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { achievementTypeId, dateAchieved, notes } = req.body;
    const a = await Achievement.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: "Registro não encontrado" });

    // Permissão: apenas admin ou dono
    if (req.user.role !== "admin" && req.user.id !== a.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (dateAchieved) {
      const d = new Date(dateAchieved);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ error: "Data inválida" });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const check = new Date(d);
      check.setHours(0, 0, 0, 0);
      if (check > today) return res.status(400).json({ error: "Data não pode ser futura" });
    }

    // Atualiza somente campos permitidos
    if (achievementTypeId) a.achievementTypeId = achievementTypeId;
    if (dateAchieved) a.dateAchieved = dateAchieved;
    if (notes !== undefined) a.notes = notes;

    await a.save();
    res.json(a);
  } catch (e) {
    console.error("Achievement update error:", e);
    res.status(500).json({ error: "Erro ao atualizar conquista" });
  }
});

export default router;
