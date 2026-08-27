import {
  getAllRetentionSettings,
  updateRetentionSetting,
} from "./retention.service.js";
import { RETENTION_KEYS } from "./retention-setting.model.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";
import { recordAudit } from "../audit-log/audit-log.service.js";

export const getAllRetentionSettingsHandler = async (req, res) => {
  try {
    const result = await getAllRetentionSettings();
    return successsResponse(
      res,
      result,
      200,
      "Retention settings retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateRetentionSettingHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const { valueDays, applyRetroactively = false } = req.body;

    if (!RETENTION_KEYS.includes(key)) {
      return errorResponse(
        res,
        { message: `key must be one of: ${RETENTION_KEYS.join(", ")}` },
        400,
      );
    }

    if (typeof valueDays !== "number" || !Number.isFinite(valueDays) || valueDays <= 0) {
      return errorResponse(
        res,
        { message: "valueDays must be a positive number" },
        400,
      );
    }

    const updatedBy = req.user?.email;
    const result = await updateRetentionSetting(
      key,
      valueDays,
      updatedBy,
      !!applyRetroactively,
    );
    await recordAudit({
      req,
      action: "retentionSetting.update",
      entityType: "RetentionSetting",
      entityId: key,
      summary: `Updated retention setting "${key}" to ${valueDays} day(s)${applyRetroactively ? " (applied retroactively)" : ""}`,
    });
    return successsResponse(
      res,
      result,
      200,
      "Retention setting updated successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
