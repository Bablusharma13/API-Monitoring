import express from "express";
import {
  createHandler,
  getAllHandler,
  updateHandler,
  deleteHandler,
} from "./maintenance-window.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const maintenanceWindowRouter = express.Router();

maintenanceWindowRouter.get("/", getAllHandler);
maintenanceWindowRouter.post("/", authorize("admin"), createHandler);
maintenanceWindowRouter.put("/:id", authorize("admin"), updateHandler);
maintenanceWindowRouter.delete("/:id", authorize("admin"), deleteHandler);
