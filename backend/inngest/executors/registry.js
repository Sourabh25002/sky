// src/inngest/executors/registry.js
export const getExecutor = (nodeType) => {
  switch (nodeType) {
    case "start":
      return startExecutor;
    case "http":
      return httpExecutor;
    default:
      return passthroughExecutor;
  }
};

const passthroughExecutor = async (node, context) => {
  console.log(`⏭️  Passthrough: ${node.type}`);
  return context;
};

const startExecutor = async (node, context) => {
  console.log("▶️  Start node executed");
  return { ...context, initial: {} };
};

const httpExecutor = async (node, context) => {
  const { endpoint, method = "GET", body } = node.data;

  if (!endpoint) {
    throw new Error("HTTP node missing endpoint");
  }

  console.log(`🌐 HTTP ${method}: ${endpoint}`);

  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => response.text());

  console.log(`✅ HTTP response:`, result);

  return {
    ...context,
    [`${node.id}_result`]: result,
  };
};
