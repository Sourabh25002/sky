import express from "express";
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from "../controllers/workflow_controllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All workflow routes require auth
router.get("/", requireAuth, getWorkflows);
router.get("/:id", requireAuth, getWorkflowById);
router.post("/", requireAuth, createWorkflow);
router.put("/:id", requireAuth, updateWorkflow);
router.delete("/:id", requireAuth, deleteWorkflow);

export default router;
