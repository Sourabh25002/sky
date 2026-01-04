import { inngest } from "../inngest/client.ts"; // adjust path to your actual client

export const triggerGoogleForm = async (req, res) => {
  try {
    const { workflowId } = req.params;

    // Apps Script sends JSON
    const body = req.body || {};

    // TODO later: validate secret + find userId via workflow owner
    // For now: you can accept userId from body for testing
    const userId = body.userId || "TEMP_USER_ID";

    const googleForm = {
      formId: body.formId || "",
      timestamp: body.timestamp || new Date().toISOString(),
      answers: body.answers || {},
      raw: body,
    };

    await inngest.send({
      name: "workflows/execute.workflow",
      data: {
        workflowId,
        userId,
        googleForm, // <-- your node_executors will read this
      },
    }); // sending events is done via inngest.send({ name, data }) [web:124]

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
