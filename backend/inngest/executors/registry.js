// Default passthrough executor
const passthroughExecutor = async (node, context) => {
  console.log(`⏭️  Passthrough: ${node.type}(${node.id.slice(0, 8)})`);
  return context;
};

// Start node executor
const startExecutor = async (node, context) => {
  console.log("▶️  Start node executed");
  return { ...context, initial: { timestamp: new Date().toISOString() } };
};

// HTTP Executor - FIXED TO HANDLE 'url' AND 'endpoint'
const httpExecutor = async (node, context) => {
  console.log("🌐 HTTP Executor - Raw node.data:", node.data);
  
  // Safe data extraction - SUPPORTS BOTH 'url' AND 'endpoint' (frontend compatibility)
  const data = node.data || {};
  const endpoint = data.endpoint || data.url;  // ✅ FIX: Try both!
  const method = (data.method || "GET").toUpperCase();
  const body = data.body;

  console.log(`🌐 HTTP Request Details:`, { 
    endpoint, 
    method, 
    body: body ? `[${typeof body}] ${JSON.stringify(body).slice(0, 100)}...` : null,
    source: data.endpoint ? 'endpoint' : data.url ? 'url' : 'none'
  });

  // Validation
  if (!endpoint) {
    throw new Error(`HTTP node "${node.id}" missing endpoint/url. Received data: ${JSON.stringify(data)}`);
  }
  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    throw new Error(`HTTP node "${node.id}" invalid URL: ${endpoint}. Must start with http:// or https://`);
  }

  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    throw new Error(`HTTP node "${node.id}" invalid method "${method}". Use GET, POST, PUT, PATCH, DELETE`);
  }

  try {
    const fetchOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Sky-Workflow/1.0"
      },
    };

    // Add body for non-GET requests
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    console.log(`🌐 Fetching: ${method} ${endpoint}`);
    
    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`HTTP ${method} ${endpoint} failed: ${response.status} ${response.statusText}. Response: ${errorText.slice(0, 200)}`);
    }

    // Parse response
    let result;
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    console.log(`✅ HTTP ${method} ${endpoint}:`, { 
      status: response.status, 
      contentType,
      dataPreview: typeof result === "object" ? JSON.stringify(result, null, 2).slice(0, 300) : result.slice(0, 300)
    });

    return {
      ...context,
      [`${node.id}_result`]: result,
      http_response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: result,
        endpoint: endpoint  // Store which URL was used
      }
    };

  } catch (error) {
    console.error(`❌ HTTP ${node.id} failed:`, error);
    throw new Error(`HTTP node "${node.id}" execution failed: ${error.message}`);
  }
};

// Google Form Trigger Executor (Video 2:46:27)
const googleFormExecutor = async (node, context, step) => {
  console.log("📋 Google Form Trigger:", node.data?.formId);
  
  // ✅ REAL DATA from webhook OR test data
  const formData = context.initialData?.formData || {
    formId: node.data?.formId || "test-form",
    fields: { 
      email: "test@example.com", 
      name: "Test User",
      message: "Test submission"
    }
  };

  const result = {
    formId: formData.formId,
    timestamp: new Date().toISOString(),
    submission: formData.fields,
    raw: formData
  };

  console.log("📋 Form submission:", result);

  return {
    ...context,
    google_form: result,
    trigger: result.fields // {{trigger.email}} for templating
  };
};


// Executor Registry
export const getExecutor = (nodeType) => {
  switch (nodeType) {
    case "start":
    case "manual":
    case "trigger":
      return startExecutor;
    case "google-form":
    case "googleform":
      return googleFormExecutor;  // ✅ NEW!
    case "http":
    case "httprequest":
      return httpExecutor;
    default:
      return passthroughExecutor;
  }
};
