import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getUserModel } from "./auth.model.js";

const BCRYPT_ROUNDS = 10;
const JWT_EXPIRES_IN = "7d";

export const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

export const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

export const login = async (email, password) => {
  const User = getUserModel();
  const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
  if (!user) throw new Error("Invalid email or password");

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const getUserById = async (id) => {
  const User = getUserModel();
  const user = await User.findById(id).select("-passwordHash");
  if (!user) throw new Error("User not found");
  return user;
};
