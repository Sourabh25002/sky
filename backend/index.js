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
import triggerRoutes from "./routes/triggerRoutes.js";

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

// Custom Routes
app.use("/api/workflows", workflowsRouter);
app.use("/api", triggerRoutes);

// Server and Database Connection
const PORT = process.env.PORT;
if (!PORT) {
  console.error("Error: PORT environment variable is not defined.");
  process.exit(1);
}

await checkDatabaseConnection();

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
