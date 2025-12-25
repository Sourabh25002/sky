import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.ts";
import { auth } from "./utils/auth.ts";
import { checkDatabaseConnection } from "./database/db.js";
// import {
//   createNodesTable,
//   createConnectionsTable,
//   createWorkflowsTable,
// } from "./database/schemas.js";
import workflowsRouter from "./routes/workflow_routes.js";
import googleFormRouter from "./routes/google_form_routes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // React frontend
    credentials: true, // allow cookies
  })
);

// Then other middleware
app.use(express.json());

// Mount Better Auth
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

async function runDatabaseSetup() {
  await checkDatabaseConnection();
  // await createWorkflowsTable();
  // await createNodesTable();
  // await createConnectionsTable();
}

runDatabaseSetup().catch((err) => {
  console.error("Error in main:", err);
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello, sky");
});

// Mount workflows API under /api/workflows
app.use("/api/workflows", workflowsRouter);
app.use("/api/trigger/google-form", googleFormRouter);

// PORT and server setup
const PORT = process.env.PORT;
if (!PORT) {
  console.error("Error: PORT environment variable is not defined.");
  process.exit(1);
}
app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
