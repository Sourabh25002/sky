import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8000/api/auth", // Your Express backend
  plugins: [
    polarClient(),
    organizationClient(), // Optional: for organization features
  ],
});
