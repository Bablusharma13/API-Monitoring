import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/shared/db.js";
import Category from "../src/modules/categories/category.model.js";
import { TeamMember } from "../src/modules/team-members/team-members.model.js";

const run = async () => {
  await connectDB();

  const existing = await Category.findOne({ name: "General" });
  if (existing) {
    console.log(`Category already exists: ${existing._id} (${existing.name})`);
    process.exit(0);
  }

  const owner = await TeamMember.findOne({ employee_id: 1 });

  const category = await Category.create({
    name: "General",
    description: "Default category for uncategorized APIs",
    owner: owner?._id || null,
  });

  console.log(`Category created: ${category._id} (${category.name}), owner: ${owner?.name || "none"}`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
