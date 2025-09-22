import express from "express";
import { User } from "../sequelize.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
const router = express.Router();

router.get("/", async (req, res) => {
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
    ],
  });
  res.json(users);
});

/*
router.get("/:id", async (req, res) => {
  const users = await User.findByPk(req.params.id, {
    attributes: [
      "id",
      "name",
      "email",
      "role",
      "cpf",
      "nickname",
      "phone",
      "createdAt",
    ],
  });
  res.json(users);
});
*/
router.post("/", async (req, res) => {
  const userregistration = await User.create(req.body);
  res.json(userregistration);
});

router.put("/:id", async (req, res) => {
  await User.update(req.body, { where: { id: req.params.id } });
  res.json({ok: true});
});

export default router;
