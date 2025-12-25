// src/hooks/useExecuteWorkflow.js
import { useState } from "react";

export const useExecuteWorkflow = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const executeWorkflow = async (workflowId) => {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/workflows/${workflowId}/execute`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log("✅ Workflow triggered:", data);
      return data;
    } catch (err) {
      console.error("Execute error:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { executeWorkflow, isPending, error };
};
