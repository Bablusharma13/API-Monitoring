import {
  createCategory,
  getAllCategories,
  getCategorySummary,
  bulkDeleteCategories,
  deleteCategoryById,
} from "./category.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const createCategoryHandler = async (req, res) => {
  try {
    const category = await createCategory(req.body);
    return successsResponse(
      res,
      category,
      201,
      "Category created successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllCategoriesHandler = async (req, res) => {
  try {
    const result = await getAllCategories(req.query);
    return successsResponse(
      res,
      result,
      200,
      "Categories retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const bulkDeleteCategoriesHandler = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(
        res,
        { message: "ids must be a non-empty array" },
        400,
      );
    }
    const result = await bulkDeleteCategories(ids);
    return successsResponse(
      res,
      result,
      200,
      "Categories deleted successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteCategoryHandler = async (req, res) => {
  try {
    const result = await deleteCategoryById(req.params.id);
    return successsResponse(res, result, 200, "Category deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getCategorySummaryHandler = async (req, res) => {
  try {
    const summary = await getCategorySummary();
    return successsResponse(
      res,
      summary,
      200,
      "Category summary retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
