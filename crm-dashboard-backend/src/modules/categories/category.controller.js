import {
  createCategory,
  getAllCategories,
  getCategorySummary,
  bulkDeleteCategories,
  deleteCategoryById,
  updateCategory,
} from "./category.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";
import { recordAudit } from "../audit-log/audit-log.service.js";

export const createCategoryHandler = async (req, res) => {
  try {
    const category = await createCategory(req.body);
    await recordAudit({
      req,
      action: "category.create",
      entityType: "Category",
      entityId: category._id,
      summary: `Created category "${category.name}"`,
    });
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
    await recordAudit({
      req,
      action: "category.bulkDelete",
      entityType: "Category",
      entityId: ids.join(","),
      summary: `Bulk deleted ${result.deleted} categor${result.deleted === 1 ? "y" : "ies"} (ids: ${ids.join(", ")})`,
    });
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

export const updateCategoryHandler = async (req, res) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    await recordAudit({
      req,
      action: "category.update",
      entityType: "Category",
      entityId: category._id,
      summary: `Updated category "${category.name}"`,
    });
    return successsResponse(res, category, 200, "Category updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteCategoryHandler = async (req, res) => {
  try {
    const result = await deleteCategoryById(req.params.id);
    await recordAudit({
      req,
      action: "category.delete",
      entityType: "Category",
      entityId: req.params.id,
      summary: `Deleted category ${req.params.id}`,
    });
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
