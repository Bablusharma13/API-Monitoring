import express from "express";
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategorySummaryHandler,
  bulkDeleteCategoriesHandler,
  deleteCategoryHandler,
} from "./category.controller.js";

export const categoryRouter = express.Router();

categoryRouter.delete("/bulk", bulkDeleteCategoriesHandler);
categoryRouter.delete("/:id", deleteCategoryHandler);
categoryRouter.post("/", createCategoryHandler);
categoryRouter.get("/summary", getCategorySummaryHandler);
categoryRouter.get("/", getAllCategoriesHandler);
