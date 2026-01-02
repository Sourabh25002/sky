import express from "express";
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
} from "../controllers/workflow_controllers.js";
import { requireAuth } from "../middleware/requireVerifiedUser.js";

const router = express.Router();

router.get("/", requireAuth, getWorkflows);
router.get("/:id", requireAuth, getWorkflowById);
router.post("/", requireAuth, createWorkflow);
router.put("/:id", requireAuth, updateWorkflow);
router.delete("/:id", requireAuth, deleteWorkflow);
router.post("/:id/execute", requireAuth, executeWorkflow);

export default router;
