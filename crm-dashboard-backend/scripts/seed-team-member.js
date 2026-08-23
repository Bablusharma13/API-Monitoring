import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/shared/db.js";
import { TeamMember } from "../src/modules/team-members/team-members.model.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDB();

  const existing = await TeamMember.findOne({ employee_id: 1 });
  if (existing) {
    console.log(`Team member with employee_id 1 already exists: ${existing.name || existing._id}`);
    process.exit(0);
  }

  const member = await TeamMember.create({
    team: [],
    name: "Bablu",
    email: "bablu@allheartweb.com",
    employee_id: 1,
    profile_name: "developer",
    status: "active",
    isCompleted: true,
  });

  console.log(`Team member created: ${member._id} (${member.name})`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
