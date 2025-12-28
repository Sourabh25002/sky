const topologicalSort = (nodes, connections) => {
  if (connections.length === 0) return nodes;

  // Build graph: nodeId -> [dependencies]
  const graph = {};
  const indegree = {};

  // Initialize all nodes
  nodes.forEach((node) => {
    graph[node.id] = [];
    indegree[node.id] = 0;
  });

  // Build edges + indegrees
  connections.forEach((c) => {
    if (graph[c.fromNodeId] && graph[c.toNodeId]) {
      graph[c.fromNodeId].push(c.toNodeId);
      indegree[c.toNodeId]++;
    }
  });

  // Kahn's Algorithm (BFS)
  const queue = [];
  Object.keys(indegree).forEach((nodeId) => {
    if (indegree[nodeId] === 0) queue.push(nodeId);
  });

  const sortedNodeIds = [];
  while (queue.length > 0) {
    const nodeId = queue.shift();
    sortedNodeIds.push(nodeId);

    graph[nodeId].forEach((neighbor) => {
      indegree[neighbor]--;
      if (indegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles
  if (sortedNodeIds.length !== nodes.length) {
    throw new Error("Workflow contains cyclic dependencies");
  }

  return nodes.filter((node) => sortedNodeIds.includes(node.id));
};

export { topologicalSort };
