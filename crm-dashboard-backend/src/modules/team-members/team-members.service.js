import { TeamMember } from "./team-members.model.js";

const ALLOWED_FIELDS = [
  "team",
  "name",
  "email",
  "phone",
  "image_url",
  "profile_name",
  "employee_id",
  "status",
];

const getNextEmployeeId = async () => {
  const last = await TeamMember.findOne()
    .sort({ employee_id: -1 })
    .select("employee_id")
    .lean();
  return (last?.employee_id || 0) + 1;
};

export const createTeamMember = async (data = {}) => {
  const payload = {};

  ALLOWED_FIELDS.forEach((field) => {
    if (data[field] !== undefined) {
      payload[field] = data[field];
    }
  });

  if (payload.employee_id === undefined || payload.employee_id === null) {
    payload.employee_id = await getNextEmployeeId();
  }

  if (payload.team === undefined) {
    payload.team = [];
  }

  payload.isCompleted = true;

  return TeamMember.create(payload);
};

export const updateTeamMember = async (id, data = {}) => {
  const member = await TeamMember.findOne({ _id: id, is_deleted: false });
  if (!member) throw { message: "Team member not found", statusCode: 404 };

  ALLOWED_FIELDS.forEach((field) => {
    if (data[field] !== undefined) {
      member[field] = data[field];
    }
  });

  return member.save();
};

export const softDeleteTeamMember = async (id) => {
  return TeamMember.findOneAndUpdate(
    { _id: id, is_deleted: false },
    { is_deleted: true, deleted_at: new Date() },
    { new: true },
  );
};

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
