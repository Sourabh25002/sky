import express from "express";
import { inngest } from "../inngest/client.ts";

const router = express.Router();

// ✅ GOOGLE FORM WEBHOOK ENDPOINT
router.post("/:workflowId", async (req, res) => {
  try {
    const { workflowId } = req.params;
    const formData = req.body; // Google Form sends: { entry.0: "value", ... }

    console.log("📋 Google Form webhook:", { workflowId, formData });

    // ✅ TRIGGER WORKFLOW with REAL form data
    await inngest.send({
      name: "workflows/execute.workflow",
      data: {
        workflowId,
        userId: "google-form-trigger", // Special user for forms
        initialData: {
          trigger: "google-form",
          timestamp: new Date().toISOString(),
          formData: parseGoogleFormData(formData), // Clean format
        },
      },
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Google Form webhook error:", error);
    res.status(500).json({ error: "Webhook failed" });
  }
});

// ✅ Parse Google Form's weird format: entry.12345 → email
function parseGoogleFormData(rawData) {
  const cleanData = {};
  for (const [key, value] of Object.entries(rawData)) {
    if (key.startsWith("entry.")) {
      const fieldName = key.replace("entry.", ""); // entry.123 → 123
      cleanData[fieldName] = value;
    }
  }
  return cleanData;
}

export default router;
