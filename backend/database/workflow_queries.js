// backend/db/workflow-queries.js - FIXED VERSION
import { pool } from "./db.js";

export async function getWorkflowWithNodesAndConnections(workflowId, userId) {
  const client = await pool.connect();
  try {
    // ✅ 3 SEPARATE QUERIES = NO DUPLICATES!
    const [workflowRes, nodesRes, connectionsRes] = await Promise.all([
      client.query("SELECT * FROM workflows WHERE id = $1 AND user_id = $2", [
        workflowId,
        userId,
      ]),
      client.query(
        "SELECT id, type, position, data FROM nodes WHERE workflow_id = $1",
        [workflowId]
      ),
      client.query(
        "SELECT id, source_node_id as fromNodeId, target_node_id as toNodeId FROM connections WHERE workflow_id = $1",
        [workflowId]
      ),
    ]);

    if (workflowRes.rowCount === 0) {
      const allWorkflows = await client.query(
        "SELECT id, user_id FROM workflows LIMIT 3"
      );
      throw new Error(
        `Workflow not found for user ${userId}. Available: ${allWorkflows.rows
          .map((w) => w.id)
          .join(", ")}`
      );
    }

    console.log("✅ Clean data:", {
      nodeCount: nodesRes.rowCount,
      connectionCount: connectionsRes.rowCount,
    });

    return {
      id: workflowRes.rows[0].id,
      nodes: nodesRes.rows, // ✅ Clean unique nodes
      connections: connectionsRes.rows, // ✅ Clean unique connections
    };
  } finally {
    client.release();
  }
}
