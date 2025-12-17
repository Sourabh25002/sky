import { pool } from "../database/db.js";

// GET /api/workflows
export async function getWorkflows(req, res) {
  const userId = req.user.id; // from Better Auth middleware
  const { status } = req.query;

  const params = [userId];
  let where = "user_id = $1";

  if (status) {
    params.push(status);
    where += ` AND status = $${params.length}`;
  }

  try {
    const { rows } = await pool.query(
      `
        SELECT id, name, description, status,
               created_at, updated_at, run_count, last_run_at
        FROM workflows
        WHERE ${where}
        ORDER BY created_at DESC
      `,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching workflows:", err);
    res.status(500).json({ message: "Failed to fetch workflows" });
  }
}

// GET /api/workflows/:id
export async function getWorkflowById(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM workflows WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching workflow:", err);
    res.status(500).json({ message: "Failed to fetch workflow" });
  }
}

// POST /api/workflows
export async function createWorkflow(req, res) {
  const userId = req.user.id;
  const { name, description, definition } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const { rows } = await pool.query(
      `
        INSERT INTO workflows (
          user_id, name, description, status, definition
        )
        VALUES ($1, $2, $3, 'draft', $4)
        RETURNING *
      `,
      [userId, name, description ?? null, definition ?? {}]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating workflow:", err);
    res.status(500).json({ message: "Failed to create workflow" });
  }
}

// PUT /api/workflows/:id
export async function updateWorkflow(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, description, status, definition } = req.body;

  try {
    const { rows } = await pool.query(
      `
        UPDATE workflows
        SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          definition = COALESCE($4, definition),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND user_id = $6
        RETURNING *
      `,
      [name, description, status, definition, id, userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating workflow:", err);
    res.status(500).json({ message: "Failed to update workflow" });
  }
}

// DELETE /api/workflows/:id
export async function deleteWorkflow(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM workflows WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting workflow:", err);
    res.status(500).json({ message: "Failed to delete workflow" });
  }
}
