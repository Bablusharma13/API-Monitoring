import express from "express";
import {
  getAllTeamMembersHandler,
  getTeamMemberByIdHandler,
  createTeamMemberHandler,
  updateTeamMemberHandler,
  deleteTeamMemberHandler,
} from "./team-members.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const teamMembersRouter = express.Router();

teamMembersRouter.post("/", authorize("admin"), createTeamMemberHandler);
teamMembersRouter.get("/", getAllTeamMembersHandler);
teamMembersRouter.get("/:id", getTeamMemberByIdHandler);
teamMembersRouter.put("/:id", authorize("admin"), updateTeamMemberHandler);
teamMembersRouter.delete("/:id", authorize("admin"), deleteTeamMemberHandler);
