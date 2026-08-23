import { login, getUserById } from "./auth.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

const isProd = process.env.NODE_ENV === "production";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "crm_token";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, { message: "email and password are required" }, 400);
    }
    const { token, user } = await login(email, password);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    return successsResponse(res, { user }, 200, "Login successful");
  } catch (error) {
    return errorResponse(res, error, 401, "Invalid email or password");
  }
};

export const logoutHandler = async (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  return successsResponse(res, null, 200, "Logged out successfully");
};

export const meHandler = async (req, res) => {
  try {
    const user = await getUserById(req.user.sub);
    return successsResponse(res, user, 200, "success");
  } catch (error) {
    return errorResponse(res, error, 404);
  }
};
