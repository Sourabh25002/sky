import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.ts";
import { auth } from "./utils/auth.ts";
import { checkDatabaseConnection } from "./database/db.js";
// import { createUsersTable, createUser, getUsers } from "./database/users.js";

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
  await checkDatabaseConnection(); // Check Neon connection
  //   await createUsersTable(); // Ensure table exists

  // Example inserts (change or remove in real app)
  //   await createUser("john@example.com", "John Doe");

  //   const users = await getUsers();
  //   console.log("All users:", users);
}

runDatabaseSetup().catch((err) => {
  console.error("Error in main:", err);
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello, sky");
});

// app.use("/stock", indianApiRoute);

// PORT and server setup
const PORT = process.env.PORT;
if (!PORT) {
  console.error("Error: PORT environment variable is not defined.");
  process.exit(1);
}
app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
