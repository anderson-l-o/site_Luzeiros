import dotenv from "dotenv";
dotenv.config();
import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "aventureiros_db",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "root",
  {
    host: process.env.DB_HOST || "db",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    dialect: "mysql",
    logging: false,
  }
);

// Models definitions
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(256), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("member", "admin"),
      allowNull: false,
      defaultValue: "member",
    },
    cpf: {type: DataTypes.STRING(14), allowNull: true},
    nickname: {type: DataTypes.STRING(30), allowNull: true},
    phone: {type: DataTypes.STRING(64), allowNull: true  },    
  },
  { tableName: "users", timestamps: true }
);

const AchievementType = sequelize.define(
  "AchievementType",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.STRING(512) },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: "achievement_types", timestamps: true }
);

const Achievement = sequelize.define(
  "Achievement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dateAchieved: { type: DataTypes.DATEONLY, allowNull: false },
    notes: { type: DataTypes.STRING(512) },
  },
  { tableName: "achievements", timestamps: true }
);




User.hasMany(Achievement, { foreignKey: "userId" });
Achievement.belongsTo(User, { foreignKey: "userId" });

AchievementType.hasMany(Achievement, { foreignKey: "achievementTypeId" });
Achievement.belongsTo(AchievementType, { foreignKey: "achievementTypeId" });

export default sequelize;
export { User, AchievementType, Achievement };
