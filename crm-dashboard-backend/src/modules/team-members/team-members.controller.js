import {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  softDeleteTeamMember,
} from "./team-members.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";
import { recordAudit } from "../audit-log/audit-log.service.js";

export const createTeamMemberHandler = async (req, res) => {
  try {
    const member = await createTeamMember(req.body);
    await recordAudit({
      req,
      action: "teamMember.create",
      entityType: "TeamMember",
      entityId: member._id,
      summary: `Created team member "${member.name || member.email || member._id}"`,
    });
    return successsResponse(res, member, 201, "Team member created successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateTeamMemberHandler = async (req, res) => {
  try {
    const member = await updateTeamMember(req.params.id, req.body);
    await recordAudit({
      req,
      action: "teamMember.update",
      entityType: "TeamMember",
      entityId: member._id,
      summary: `Updated team member "${member.name || member.email || member._id}"`,
    });
    return successsResponse(res, member, 200, "Team member updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteTeamMemberHandler = async (req, res) => {
  try {
    const member = await softDeleteTeamMember(req.params.id);
    if (!member) {
      return errorResponse(res, { message: "Team member not found" }, 404);
    }
    await recordAudit({
      req,
      action: "teamMember.delete",
      entityType: "TeamMember",
      entityId: member._id,
      summary: `Soft-deleted team member "${member.name || member.email || member._id}"`,
    });
    return successsResponse(res, member, 200, "Team member deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllTeamMembersHandler = async (req, res) => {
  try {
    const result = await getAllTeamMembers(req.query);
    return successsResponse(res, result, 200, "Team members retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTeamMemberByIdHandler = async (req, res) => {
  try {
    const member = await getTeamMemberById(req.params.id);
    if (!member) {
      return errorResponse(res, { message: "Team member not found" }, 404);
    }
    return successsResponse(res, member, 200, "Team member retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
