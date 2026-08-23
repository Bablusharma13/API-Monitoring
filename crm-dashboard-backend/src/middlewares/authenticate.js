import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/responses.js";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "crm_token";

export const authenticate = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return errorResponse(res, { message: "Not authenticated" }, 401);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, error, 401, "Invalid or expired session");
  }
};
