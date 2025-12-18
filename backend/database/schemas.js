import { pool } from "./db.js";

// Create workflows table with FK to Better Auth's "user" table
export async function createWorkflowsTable() {
  const client = await pool.connect();
  try {
    // Verify user table exists first
    const userCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user' AND table_schema = 'public'
    `);

    if (userCheck.rowCount === 0) {
      throw new Error(
        "Better Auth 'user' table not found. Run Better Auth migrations first."
      );
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

        name VARCHAR(255) NOT NULL,
        description TEXT,

        status TEXT NOT NULL DEFAULT 'draft',

        definition JSONB NOT NULL DEFAULT '{}'::jsonb,

        run_count INTEGER NOT NULL DEFAULT 0,
        last_run_at TIMESTAMPTZ,
        tags TEXT[],

        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status)
    `);

    console.log(
      "✅ Workflows table created with all fields and FK to Better Auth 'user' table"
    );
  } finally {
    client.release();
  }
}

export async function createNodesTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        
        type VARCHAR(100) NOT NULL, -- 'trigger', 'openai', 'slack', etc.
        position JSONB NOT NULL, -- {x: 100, y: 200}
        data JSONB NOT NULL DEFAULT '{}'::jsonb, -- node config
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_nodes_workflow_id ON nodes(workflow_id)`
    );

    console.log("✅ Nodes table created");
  } finally {
    client.release();
  }
}

export async function createConnectionsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        
        source_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
        target_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_connections_workflow_id ON connections(workflow_id)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_node_id)`
    );

    console.log("✅ Connections table created");
  } finally {
    client.release();
  }
}
