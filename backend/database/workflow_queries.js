import { pool } from "./db.js";

export async function getWorkflowWithNodesAndConnections(workflowId, userId) {
  const client = await pool.connect();
  try {
    // 3 SEPARATE QUERIES = NO DUPLICATES!
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
        "SELECT id, source_node_id as \"fromNodeId\", target_node_id as \"toNodeId\" FROM connections WHERE workflow_id = $1",
        [workflowId]
      ),
    ]);

    if (workflowRes.rowCount === 0) {
      const allWorkflows = await client.query(
        "SELECT id, user_id FROM workflows LIMIT 5"
      );
      throw new Error(
        `Workflow not found for user ${userId}. Available: ${allWorkflows.rows
          .map((w) => w.id)
          .join(", ")}`
      );
    }

    // DEBUG: Log raw data from database
    console.log("🔍 Raw nodes from DB:");
    nodesRes.rows.forEach((node, index) => {
      console.log(`  Node ${index}:`, {
        id: node.id,
        type: node.type,
        data: node.data,
        endpoint: node.data?.endpoint,
        method: node.data?.method
      });
    });

    console.log("✅ Clean data:", {
      workflowId: workflowRes.rows[0].id,
      nodeCount: nodesRes.rowCount,
      connectionCount: connectionsRes.rowCount,
      sampleNodeData: nodesRes.rowCount > 0 ? nodesRes.rows[0].data : null
    });

    return {
      id: workflowRes.rows[0].id,
      nodes: nodesRes.rows,
      connections: connectionsRes.rows,
    };
  } finally {
    client.release();
  }
}
