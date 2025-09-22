import { User, AchievementType } from "../src/sequelize.js";
import { hashPassword } from "../src/services/authService.js";

export default async function run() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPass = process.env.SEED_ADMIN_PASSWORD;
  const exists = await User.findOne({ where: { email: adminEmail } });
  if (!exists) {
    const passwordHash = hashPassword(adminPass);
    await User.create({
      name: "Admin Luzeiros",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log("Admin user created:", adminEmail);
  } else {
    console.log("Admin already exists");
  }

  const tipos = [
    { name: "Pureza", description: "Atividades relacionadas", points: 10 },
    { name: "Mãos Ajudadoras", description: "Ajudar o próximo", points: 8 },
    { name: "Edificadores", description: "Projetos e liderança", points: 12 },
    { name: "Teste", description: "testes", points: 14 },
  ];
  for (const t of tipos) {
    const found = await AchievementType.findOne({ where: { name: t.name } });
    if (!found) await AchievementType.create(t);
  }
}
