import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
export function createToken(
  user,
  secret = process.env.JWT_SECRET || "change_this_secret",
  expiresIn = "8h"
) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
}
