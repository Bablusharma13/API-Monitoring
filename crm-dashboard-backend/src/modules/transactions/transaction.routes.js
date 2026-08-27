import express from "express";
import {
  getAllTransactionsHandler,
  createTransactionHandler,
  getTransactionByIdHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
  runNowHandler,
  getTransactionRunsHandler,
} from "./transaction.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const transactionRouter = express.Router();

transactionRouter.get("/", getAllTransactionsHandler);
transactionRouter.post("/", createTransactionHandler);
transactionRouter.get("/:id", getTransactionByIdHandler);
transactionRouter.put("/:id", updateTransactionHandler);
transactionRouter.delete("/:id", authorize("admin"), deleteTransactionHandler);
transactionRouter.post("/:id/run", runNowHandler);
transactionRouter.get("/:id/runs", getTransactionRunsHandler);
