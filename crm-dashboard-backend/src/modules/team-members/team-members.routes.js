import express from "express";
import { getAllTeamMembersHandler, getTeamMemberByIdHandler } from "./team-members.controller.js";

export const teamMembersRouter = express.Router();

teamMembersRouter.get("/", getAllTeamMembersHandler);
teamMembersRouter.get("/:id", getTeamMemberByIdHandler);
