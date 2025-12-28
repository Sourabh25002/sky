import { pool } from "../database/db.js";
import { inngest } from "../inngest/client.ts";

// GET /api/workflows
export async function getWorkflows(req, res) {
  const userId = req.user.id;
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

    const workflow = rows[0];

    // ✅ NEW: Load nodes + connections for React Flow
    const nodesResult = await pool.query(
      `SELECT id, type, position, data FROM nodes WHERE workflow_id = $1`,
      [id]
    );

    const connectionsResult = await pool.query(
      `SELECT id, source_node_id as source, target_node_id as target
       FROM connections WHERE workflow_id = $1`,
      [id]
    );

    // Format for React Flow
    workflow.definition = {
      nodes: nodesResult.rows,
      edges: connectionsResult.rows,
    };

    res.json(workflow);
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
  const client = await pool.connect();
  try {
    const { id: workflowId } = req.params;
    const userId = req.user.id;
    const { definition } = req.body;

    console.log("🔍 Frontend sent:", {
      nodes: definition.nodes?.map((n) => ({ id: n.id, type: n.type })),
      edges: definition.edges?.map((e) => ({
        source: e.source,
        target: e.target,
      })),
    });

    await client.query("BEGIN");

    // ✅ STEP 1: Get ALL current node IDs from DB
    const currentNodesResult = await client.query(
      "SELECT id FROM nodes WHERE workflow_id = $1",
      [workflowId]
    );
    const currentNodeIds = new Set(
      currentNodesResult.rows.map((row) => row.id)
    );

    // ✅ STEP 2: Get new node IDs from frontend
    const newNodes = definition.nodes || [];
    const newNodeIds = new Set(newNodes.map((node) => node.id));

    // ✅ STEP 3: Delete INVALID connections (target/source nodes don't exist)
    await client.query(
      `
        DELETE FROM connections
        WHERE workflow_id = $1
          AND (
            NOT (source_node_id = ANY($2::text[]))
            OR NOT (target_node_id = ANY($2::text[]))
          )
        `,
      [workflowId, Array.from(newNodeIds)]
    );

    // ✅ STEP 4: Delete OLD nodes (not in newNodes)
    for (const nodeId of currentNodeIds) {
      if (!newNodeIds.has(nodeId)) {
        await client.query(
          "DELETE FROM nodes WHERE id = $1 AND workflow_id = $2",
          [nodeId, workflowId]
        );
      }
    }

    // ✅ STEP 5: UPSERT (NO updated_at)
    for (const node of newNodes) {
      await client.query(
        `
    INSERT INTO nodes (id, workflow_id, type, position, data)
    VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
    ON CONFLICT (id)
    DO UPDATE SET
      type = EXCLUDED.type,
      position = EXCLUDED.position,
      data = EXCLUDED.data
  `,
        [node.id, workflowId, node.type, node.position, node.data]
      );
    }

    // ✅ STEP 6: Update ALL connections (safe - only valid nodes)
    await client.query("DELETE FROM connections WHERE workflow_id = $1", [
      workflowId,
    ]);
    for (const edge of definition.edges || []) {
      // ✅ VALIDATION: Only insert if BOTH nodes exist
      if (newNodeIds.has(edge.source) && newNodeIds.has(edge.target)) {
        await client.query(
          `
          INSERT INTO connections (id, workflow_id, source_node_id, target_node_id)
          VALUES (gen_random_uuid(), $1, $2, $3)
        `,
          [workflowId, edge.source, edge.target]
        );
      }
    }

    await client.query(
      "UPDATE workflows SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [workflowId]
    );
    await client.query("COMMIT");

    console.log("✅ Workflow saved:", {
      workflowId,
      nodeCount: newNodes.length,
      edgeCount: (definition.edges || []).length,
    });
    res.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Save error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
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

export const executeWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ✅ From auth middleware

    console.log("✅ Triggering workflow execution:", id, "for user:", userId);

    await inngest.send({
      name: "workflows/execute.workflow",
      data: {
        workflowId: id,
        userId: userId,
      },
    });

    res.json({ success: true, message: "Triggered!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
