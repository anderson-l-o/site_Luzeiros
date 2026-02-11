import express from "express";
import { Achievement, AchievementType, User } from "../sequelize.js";
import { requireAuth } from "../middlewares/auth.js";
import { Sequelize } from "sequelize";

const router = express.Router();

// GET /api/stats - Estatísticas gerais
router.get("/", async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { isActive: true } });
    const totalAchievements = await Achievement.count();
    const avgAchievementsPerUser = totalUsers > 0 ? (totalAchievements / totalUsers).toFixed(2) : 0;

    res.json({
      totalUsers,
      totalAchievements,
      avgAchievementsPerUser: parseFloat(avgAchievementsPerUser),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// GET /api/stats/recent - Últimas 5 conquistas com dados do usuário
router.get("/recent", async (req, res) => {
  try {
    const recent = await Achievement.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "nickname"],
        },
        {
          model: AchievementType,
          attributes: ["id", "name", "points"],
        },
      ],
      order: [["dateAchieved", "DESC"], ["createdAt", "DESC"]],
      limit: 5,
    });

    res.json(recent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar conquistas recentes" });
  }
});

// GET /api/stats/ranking - Ranking de usuários por pontuação total
router.get("/ranking", async (req, res) => {
  try {
    const ranking = await User.findAll({
      attributes: {
        include: [
          [
            Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("Achievements.AchievementType.points")), 0),
            "totalPoints",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("Achievements.id")), "totalAchievements"],
        ],
      },
      include: [
        {
          model: Achievement,
          attributes: [],
          include: [
            {
              model: AchievementType,
              attributes: [],
            },
          ],
          required: false,
        },
      ],
      where: { isActive: true },
      group: ["User.id"],
      order: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("Achievements.AchievementType.points")), 0), "DESC"]],
      subQuery: false,
      raw: true,
      limit: 10,
    });

    // Mapeia resultado para incluir ranking
    const rankedUsers = ranking.map((u, idx) => ({
      rank: idx + 1,
      ...u,
      totalPoints: parseInt(u.totalPoints) || 0,
      totalAchievements: parseInt(u.totalAchievements) || 0,
    }));

    res.json(rankedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ranking" });
  }
});

export default router;
