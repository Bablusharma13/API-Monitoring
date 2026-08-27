import {
  createCronJob,
  getAllCronJobs,
  getCronJobById,
  updateCronJob,
  deleteCronJob,
  toggleCronJob,
  recordPing,
  getCronJobSummary,
  getPingHistory,
  getPingStats,
  runNow,
} from "./cron-job.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const createHandler = async (req, res, next) => {
  try {
    const job = await createCronJob(req.body);
    return successsResponse(res, job);
  } catch (err) {
    next(err);
  }
};

export const getAllHandler = async (req, res, next) => {
  try {
    const result = await getAllCronJobs(req.query);
    return successsResponse(res, result);
  } catch (err) {
    next(err);
  }
};

export const getByIdHandler = async (req, res, next) => {
  try {
    const job = await getCronJobById(req.params.id, req.query);
    if (!job) return errorResponse(res, "Cron job not found", 404);
    return successsResponse(res, job);
  } catch (err) {
    next(err);
  }
};

export const updateHandler = async (req, res, next) => {
  try {
    const job = await updateCronJob(req.params.id, req.body);
    if (!job) return errorResponse(res, "Cron job not found", 404);
    return successsResponse(res, job, 200, "Cron job updated");
  } catch (err) {
    next(err);
  }
};

export const deleteHandler = async (req, res, next) => {
  try {
    const job = await deleteCronJob(req.params.id);
    if (!job) return errorResponse(res, "Cron job not found", 404);
    return successsResponse(res, job, 200, "Cron job deleted");
  } catch (err) {
    next(err);
  }
};

export const toggleHandler = async (req, res, next) => {
  try {
    const job = await toggleCronJob(req.params.id);
    if (!job) return errorResponse(res, "Cron job not found", 404);
    return successsResponse(res, job);
  } catch (err) {
    next(err);
  }
};

export const recordPingHandler = async (req, res, next) => {
  try {
    const result = await recordPing(req.params.slug);
    if (!result) return errorResponse(res, "Invalid slug", 404);
    return successsResponse(res, result);
  } catch (err) {
    next(err);
  }
};

export const getSummaryHandler = async (req, res, next) => {
  try {
    const summary = await getCronJobSummary();
    return successsResponse(res, summary);
  } catch (err) {
    next(err);
  }
};

export const getPingHistoryHandler = async (req, res, next) => {
  try {
    const result = await getPingHistory(req.params.id, req.query);
    return successsResponse(res, result);
  } catch (err) {
    next(err);
  }
};

export const getPingStatsHandler = async (req, res) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 30;
    const result = await getPingStats(req.params.id, days);
    return successsResponse(
      res,
      result,
      200,
      "Ping stats retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const runNowHandler = async (req, res, next) => {
  try {
    const job = await runNow(req.params.id);
    if (!job) return errorResponse(res, "Cron job not found", 404);
    return successsResponse(res, job);
  } catch (err) {
    next(err);
  }
};
