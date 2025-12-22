// import dotenv from "dotenv";
// import pkg from "pg";

// dotenv.config();

// const { Pool } = pkg;

// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// export async function checkDatabaseConnection() {
//   const client = await pool.connect();
//   try {
//     const res = await client.query("SELECT now()");
//     console.log("Connected to Neon, time:", res.rows[0].now);
//   } finally {
//     client.release();
//   }
// }

import pkg from "pg"; // Import the pg package as a whole
const { Pool } = pkg; // Destructure the Pool class from the package
import * as dotenv from "dotenv";
dotenv.config();

// Local Database configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sky_db",
  password: process.env.PASSWORD,
  port: 5432,
});

// Function to check the database connection
const checkDatabaseConnection = async () => {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL");
    return pool;
  } catch (err) {
    console.error("Connection error", err.stack);
    throw err;
  }
};

// Export the pool and the check connection function
export { pool, checkDatabaseConnection };
