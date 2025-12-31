const topologicalSort = (nodes, connections) => {
  if (connections.length === 0) return nodes;

  const graph = {};
  const indegree = {};

  nodes.forEach((node) => {
    graph[node.id] = [];
    indegree[node.id] = 0;
  });

  connections.forEach((c) => {
    // IMPORTANT: adjust these keys to match your edge shape:
    // if your edges are { source, target }, use c.source/c.target
    const from = c.fromNodeId ?? c.source;
    const to = c.toNodeId ?? c.target;

    if (graph[from] && graph[to]) {
      graph[from].push(to);
      indegree[to]++;
    }
  });

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
      if (indegree[neighbor] === 0) queue.push(neighbor);
    });
  }

  if (sortedNodeIds.length !== nodes.length) {
    throw new Error("Workflow contains cyclic dependencies");
  }

  // ✅ preserve topo order
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeById.get(id)).filter(Boolean);
};

export { topologicalSort };
