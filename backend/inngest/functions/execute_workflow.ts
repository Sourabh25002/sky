import { inngest } from "../client.ts";
import { getWorkflowWithNodesAndConnections } from "../../database/workflow_queries.js";
import { topologicalSort } from "../../utils/topoSort.js";
import { getExecutor } from "../../utils/node_executors.js";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
    const { workflowId, userId } = event.data;

    const workflow = await step.run("prepare-workflow", async () => {
      console.log("Loaded workflow data");
      return await getWorkflowWithNodesAndConnections(workflowId, userId);
    });

    const sortedNodes = await step.run("topological-sort", async () => {
      console.log("Nodes topo. sorted");
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Initial execution context
    let context: any = {
      initialData: event.data,
      trigger: {
        type: event.data?.googleForm ? "google_form" : "manual",
        payload: event.data?.googleForm ?? null,
      },
    };

    for (const node of sortedNodes) {
      const nodeType = node?.data?.originalType || node.type;
      const executor = getExecutor(nodeType);

      context = await step.run(`node:${node.id}`, async () => {
        return await executor(node, context);
      });
    }

    return { ok: true, workflowId, lastContext: context };
  }
);
