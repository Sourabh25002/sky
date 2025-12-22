// src/inngest/index.ts - FIXED VERSION
import { Inngest } from "inngest";
import { getWorkflowWithNodesAndConnections } from "../database/workflow_queries.js"; // ✅ .js extension
import { topologicalSort } from "../utils/topoSort.js";
import { getExecutor } from "./executors/registry.js"; // ✅ .js extension

export const inngest = new Inngest({ id: "sky" });

// ✅ Type Definitions
interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

interface WorkflowResult {
  id: string;
  nodes: Node[];
  connections: Connection[];
}

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ step, event }) => {
    const { workflowId, userId } = event.data; // ✅ REAL userId from controller!
    console.log("🎯 Workflow execution started:", workflowId, "user:", userId);

    // ✅ FIXED: Use REAL userId
    const workflow = await step.run("prepare-workflow", async () => {
      return await getWorkflowWithNodesAndConnections(workflowId, userId); // ✅ userId from event!
    });

    console.log(
      `📊 Loaded ${workflow.nodes.length} nodes, ${workflow.connections.length} connections`
    );

    // ✅ STEP 7: Topological sort (8:00-15:00)
    const sortedNodes: Node[] = await step.run("topological-sort", async () => {
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    console.log(
      "🔄 Node execution order:",
      sortedNodes.map((n: Node) => n.type)
    );

    // ✅ STEP 9: Main execution loop (20:00-25:00)
    let context: Record<string, any> = { initial: {} };

    for (const node of sortedNodes) {
      const executor: (
        node: Node,
        context: Record<string, any>
      ) => Promise<Record<string, any>> = getExecutor(node.type);
      context = await step.run(`execute-${node.type}`, async () => {
        return await executor(node, context);
      });

      console.log(
        `✅ ${node.type} completed, context keys:`,
        Object.keys(context)
      );
    }

    console.log("🎉 Workflow execution completed!");

    return {
      status: "completed",
      workflowId,
      result: context,
      nodeCount: sortedNodes.length,
    };
  }
);

export const functions = [executeWorkflow];
