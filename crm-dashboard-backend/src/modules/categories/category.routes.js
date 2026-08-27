import express from "express";
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategorySummaryHandler,
  bulkDeleteCategoriesHandler,
  deleteCategoryHandler,
  updateCategoryHandler,
} from "./category.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const categoryRouter = express.Router();

categoryRouter.delete("/bulk", authorize("admin"), bulkDeleteCategoriesHandler);
categoryRouter.delete("/:id", authorize("admin"), deleteCategoryHandler);
categoryRouter.put("/:id", updateCategoryHandler);
categoryRouter.post("/", createCategoryHandler);
categoryRouter.get("/summary", getCategorySummaryHandler);
categoryRouter.get("/", getAllCategoriesHandler);
