import express from "express";
import {
  getAllTeamMembersHandler,
  getTeamMemberByIdHandler,
  createTeamMemberHandler,
  updateTeamMemberHandler,
  deleteTeamMemberHandler,
} from "./team-members.controller.js";

export const teamMembersRouter = express.Router();

teamMembersRouter.post("/", createTeamMemberHandler);
teamMembersRouter.get("/", getAllTeamMembersHandler);
teamMembersRouter.get("/:id", getTeamMemberByIdHandler);
teamMembersRouter.put("/:id", updateTeamMemberHandler);
teamMembersRouter.delete("/:id", deleteTeamMemberHandler);
