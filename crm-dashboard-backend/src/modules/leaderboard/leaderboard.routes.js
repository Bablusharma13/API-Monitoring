import express from "express";
import { getLeaderboardHandler } from "./leaderboard.controller.js";

export const leaderboardRouter = express.Router();

leaderboardRouter.get("/", getLeaderboardHandler);
