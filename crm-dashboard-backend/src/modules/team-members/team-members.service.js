import { TeamMember } from "./team-members.model.js";

export const getAllTeamMembers = async (query = {}) => {
  const { status, search, page = 1, limit = 500 } = query;
  const filter = { is_deleted: false };

  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [members, total] = await Promise.all([
    TeamMember.find(filter).skip(skip).limit(Number(limit)).lean(),
    TeamMember.countDocuments(filter),
  ]);

  return { members, total, page: Number(page), limit: Number(limit) };
};

export const getTeamMemberById = async (id) => {
  return TeamMember.findOne({ _id: id, is_deleted: false }).lean();
};
