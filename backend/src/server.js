import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import typeRoutes from "./routes/achievementTypes.js";
import achRoutes from "./routes/achievements.js";
import userRoutes from "./routes/users.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { initDb } from "./init.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api", (_req, res) =>
  res.json({ status: "ok", service: "Aventureiros API" })
);

const swaggerPath = path.join(process.cwd(), "src", "docs", "swagger.yaml");
let swaggerDoc = {};
try {
  swaggerDoc = YAML.load(swaggerPath);
} catch (e) {}
if (swaggerDoc)
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/api/auth", authRoutes);
app.use("/api/achievement-types", typeRoutes);
app.use("/api/achievements", achRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    console.log("DB initialized");
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("DB init failed", e);
    process.exit(1);
  });
