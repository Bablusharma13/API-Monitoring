import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionRuns,
  runTransaction,
} from "./transaction.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getAllTransactionsHandler = async (req, res) => {
  try {
    const result = await getAllTransactions(req.query);
    return successsResponse(res, result, 200, "Transactions retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTransactionByIdHandler = async (req, res) => {
  try {
    const txn = await getTransactionById(req.params.id);
    return successsResponse(res, txn, 200, "Transaction retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const createTransactionHandler = async (req, res) => {
  try {
    const txn = await createTransaction(req.body);
    return successsResponse(res, txn, 201, "Transaction created successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateTransactionHandler = async (req, res) => {
  try {
    const txn = await updateTransaction(req.params.id, req.body);
    return successsResponse(res, txn, 200, "Transaction updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteTransactionHandler = async (req, res) => {
  try {
    const result = await deleteTransaction(req.params.id);
    return successsResponse(res, result, 200, "Transaction deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const runNowHandler = async (req, res) => {
  try {
    const run = await runTransaction(req.params.id);
    return successsResponse(res, run, 200, "Transaction run completed");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTransactionRunsHandler = async (req, res) => {
  try {
    const result = await getTransactionRuns(req.params.id, req.query);
    return successsResponse(res, result, 200, "Transaction runs retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
