import * as dotenv from "dotenv";
dotenv.config();
import { inngest } from "./client.ts";
import { getWorkflowWithNodesAndConnections } from "../database/workflow_queries.js";
import { topologicalSort } from "../utils/topoSort.js";
import { getExecutor } from "./executors/registry.js";
import { helloFunction } from "./functions/hello.ts";

// Type Definitions
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
    const { workflowId, userId } = event.data;
    console.log("🎯 Workflow execution started:", workflowId, "user:", userId);

    // STEP 1: Fetch workflow data
    const workflow = await step.run("prepare-workflow", async () => {
      return await getWorkflowWithNodesAndConnections(workflowId, userId);
    });

    console.log(
      `📊 Loaded ${workflow.nodes.length} nodes, ${workflow.connections.length} connections`
    );

    // DEBUG: Log ALL nodes data
    workflow.nodes.forEach((node, index) => {
      console.log(`🔍 Node ${index}:`, {
        id: node.id,
        type: node.type,
        data: node.data,
        hasEndpoint: node.data?.endpoint,
        hasMethod: node.data?.method,
      });
    });

    // STEP 2: Topological sort
    const sortedNodes: Node[] = await step.run("topological-sort", async () => {
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    console.log(
      "🔄 Node execution order:",
      sortedNodes.map((n: Node) => `${n.type}(${n.id.slice(0, 8)})`).join(" → ")
    );

    // STEP 3: Main execution loop
    let context: Record<string, any> = { initial: {} };

    for (const node of sortedNodes) {
      console.log(`\n🚀 Executing node ${node.id} (${node.type}):`, {
        data: node.data,
        hasEndpoint: !!node.data?.endpoint,
        fullNode: node,
      });

      const executor = getExecutor(node.type);
      context = await step.run(`execute-${node.id}-${node.type}`, async () => {
        return await executor(node, context);
      });

      console.log(
        `✅ ${node.type}(${node.id.slice(0, 8)}) completed, context keys:`,
        Object.keys(context)
      );
    }

    console.log("🎉 Workflow execution completed!", {
      finalContextKeys: Object.keys(context),
      workflowId,
    });

    return {
      status: "completed",
      workflowId,
      result: context,
      nodeCount: sortedNodes.length,
    };
  }
);

export const functions = [executeWorkflow, helloFunction];
