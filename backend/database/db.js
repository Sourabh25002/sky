import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function checkDatabaseConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT now()");
    console.log("Connected to Neon, time:", res.rows[0].now);
  } finally {
    client.release();
  }
}
