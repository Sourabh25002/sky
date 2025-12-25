import React from "react";
import { authClient } from "../utils/auth";

export function UpgradeButton() {
  const handleUpgrade = async () => {
    await authClient.checkout({
      slug: "pro", // uses the slug from your backend checkout config
      // optional: referenceId: orgId if you use organizations
    });
    // This call will redirect the browser to Polar checkout
  };

  return <button onClick={handleUpgrade}>Upgrade to Pro</button>;
}
