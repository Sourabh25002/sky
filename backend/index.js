import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { toNodeHandler } from "better-auth/node";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.ts";
import { functions } from "./inngest/index.ts";
import { auth } from "./utils/auth.ts";
import { checkDatabaseConnection } from "./database/db.js";
import workflowsRouter from "./routes/workflow_routes.js";
import googleFormRouter from "./routes/google_form_routes.js";
// import { createNodesTable } from "./database/schemas.js";

dotenv.config();
const app = express();

app.use(helmet());
app.use(compression());

app.use(
  morgan("dev", {
    skip: (req) =>
      req.method === "PUT" && req.originalUrl.startsWith("/api/inngest"),
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Better Auth
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to sky backend!");
});

// APIs
app.use("/api/workflows", workflowsRouter);
app.use("/api/trigger/google-form", googleFormRouter);

// Server and Database Connection
const PORT = process.env.PORT;
if (!PORT) {
  console.error("Error: PORT environment variable is not defined.");
  process.exit(1);
}

await checkDatabaseConnection();
// await createWorkflowsTable();

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
