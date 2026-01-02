import pkg from "pg";
const { Pool } = pkg;
import * as dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sky_db",
  password: process.env.PASSWORD,
  port: 5432,
});

const checkDatabaseConnection = async () => {
  try {
    await pool.connect();
    console.log("Connected to DB");
    return pool;
  } catch (err) {
    console.error("Connection error", err.stack);
    throw err;
  }
};

export { pool, checkDatabaseConnection };
