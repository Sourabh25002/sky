import express from "express";
import dotenv from "dotenv";
import { checkDatabaseConnection } from "./database/db.js";
// import { createUsersTable, createUser, getUsers } from "./database/users.js";

dotenv.config();
const app = express();

// testConnection().catch((err) => {
//   console.error("Error connecting to Neon:", err);
// });

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
