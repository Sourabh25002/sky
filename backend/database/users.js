import { pool } from "./db.js";

// Create users table with required schema
export async function createUsersTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    console.log("Users table created (or already exists)");
  } finally {
    client.release();
  }
}

// Insert a new user
export async function createUser(email, name) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      INSERT INTO users (email, name)
      VALUES ($1, $2)
      RETURNING id, email, name, created_at
      `,
      [email, name]
    );
    console.log("Created user:", res.rows[0]);
    return res.rows[0];
  } finally {
    client.release();
  }
}

// Get all users
export async function getUsers() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT id, email, name, created_at FROM users ORDER BY id"
    );
    return res.rows;
  } finally {
    client.release();
  }
}

/*
model Workflow {
id string default
name String
}
*/
