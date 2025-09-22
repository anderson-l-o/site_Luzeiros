import sequelize from "./sequelize.js";
import runSeed from "../seeders/seed-admin-and-types.js";

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function initDb() {
  const maxAttempts = 30;
  const delayMs = 2000;
  let attempt = 0;
  while (true) {
    try {
      await sequelize.authenticate();
      console.log("Database connection OK");
      await sequelize.sync({ alter: true });
      console.log("Database synced");
      try {
        await runSeed();
      } catch (e) {
        console.error("Seeder error", e);
      }
      return;
    } catch (e) {
      attempt++;
      console.log(
        `DB connect attempt ${attempt} failed. Retrying in ${delayMs}ms...`
      );
      if (attempt >= maxAttempts) {
        console.error("Could not connect to DB after several attempts", e);
        throw e;
      }
      await wait(delayMs);
    }
  }
}

export default initDb;
