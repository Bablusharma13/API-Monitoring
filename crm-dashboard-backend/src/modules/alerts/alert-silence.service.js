import AlertSilence from "./alert-silence.model.js";

export const createAlertSilence = async (data) => {
  const silence = new AlertSilence(data);
  return await silence.save();
};

export const getAllAlertSilences = async (query) => {
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const filter = {};

  const [total, silences] = await Promise.all([
    AlertSilence.countDocuments(filter),
    AlertSilence.find(filter)
      .populate("scope.categoryIds", "name")
      .populate("scope.apiIds", "name")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: silences,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
      hasPrevPage: Number(page) > 1,
    },
  };
};

export const deleteAlertSilence = async (id) => {
  const silence = await AlertSilence.findByIdAndDelete(id);
  if (!silence) throw { message: "Alert silence not found", statusCode: 404 };
  return { deleted: id };
};
