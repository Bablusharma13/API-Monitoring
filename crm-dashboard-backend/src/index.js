import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { connectDB } from "./shared/db.js";
import { connectAuthDB } from "./modules/auth/auth.connection.js";
//import "./worker.js";

const PORT = process.env.PORT;

const start = async () => {
  await connectDB();
  await connectAuthDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
