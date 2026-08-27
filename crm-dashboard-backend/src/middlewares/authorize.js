import { errorResponse } from "../utils/responses.js";

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        { message: "Forbidden" },
        403,
        "You do not have permission to perform this action",
      );
    }
    return next();
  };
