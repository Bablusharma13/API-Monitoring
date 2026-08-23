import dotenv from "dotenv";
dotenv.config();

import { connectAuthDB } from "../src/modules/auth/auth.connection.js";
import { getUserModel } from "../src/modules/auth/auth.model.js";
import { hashPassword } from "../src/modules/auth/auth.service.js";

const run = async () => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set (in .env or inline env)");
    process.exit(1);
  }

  await connectAuthDB();
  const User = getUserModel();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    console.log(`User ${normalizedEmail} already exists — skipping.`);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);
  await User.create({ name, email: normalizedEmail, passwordHash, role: "admin" });
  console.log(`Admin user ${normalizedEmail} created successfully.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
