import express from "express";
import { loginHandler, logoutHandler, meHandler } from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

export const authRouter = express.Router();

authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.get("/me", authenticate, meHandler);
