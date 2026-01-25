import { inngest } from "../client.ts";
import { NonRetriableError } from "inngest";
import { getWorkflowWithNodesAndConnections } from "../../database/workflow_queries.js";
import { topologicalSort } from "../../utils/topoSort.js";
import { getExecutor } from "../../utils/node_executors.js";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
    const { workflowId, userId } = event.data;

    // 1. PREPARE WORKFLOW
    const workflow = await step.run("prepare-workflow", async () => {
      console.log("Loaded workflow data");
      return await getWorkflowWithNodesAndConnections(workflowId, userId);
    });

    // 2. TOPOLOGICAL SORT
    const sortedNodes = await step.run("topological-sort", async () => {
      console.log("Nodes topo. sorted");
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // BUILD PARENT MAP
    const parentMap: Record<string, string[]> = {};

    workflow.connections.forEach((conn) => {
      const childId = conn.toNodeId || conn.target_node_id || conn.target;
      const parentId = conn.fromNodeId || conn.source_node_id || conn.source;

      if (!childId || !parentId) {
        console.warn("Skipping invalid connection:", conn);
        return;
      }

      if (!parentMap[childId]) {
        parentMap[childId] = [];
      }
      parentMap[childId].push(parentId);
    });

    // INITIAL CONTEXT
    let context: any = {
      initialData: event.data,
      trigger: {
        type: event.data?.googleForm ? "google_form" : "manual",
        payload: event.data?.googleForm ?? null,
      },
    };

    // 3. EXECUTE EACH NODE
    for (const node of sortedNodes) {
      const nodeType = node?.data?.originalType || node.type;
      const executor = getExecutor(nodeType);
      const parentIds = parentMap[node.id] || [];
      const nodeWithParents = { ...node, parents: parentIds };

      context = await step.run(`node:${node.id}`, async () => {
        try {
          return await executor(nodeWithParents, context);
        } catch (error: any) {
          const isLogicError =
            error.message.includes("missing") ||
            error.message.includes("not found") ||
            error.message.includes("undefined");

          if (isLogicError) {
            console.error(
              `Fatal logic error in node ${node.id}: ${error.message}`,
            );
            throw new NonRetriableError(
              `Node ${node.id} failed: ${error.message}`,
            );
          }

          throw error;
        }
      });
    }

    return { ok: true, workflowId, lastContext: context };
  },
);
