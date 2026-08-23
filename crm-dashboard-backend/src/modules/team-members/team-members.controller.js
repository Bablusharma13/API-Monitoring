import { getAllTeamMembers, getTeamMemberById } from "./team-members.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

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
