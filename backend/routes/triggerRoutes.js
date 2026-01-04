import express from "express";
import { triggerGoogleForm } from "../controllers/triggerController.js";

const router = express.Router();

// Apps Script will POST here
router.post("/trigger/google-form/:workflowId", triggerGoogleForm);

export default router;
