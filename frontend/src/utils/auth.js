import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";
import { organizationClient } from "better-auth/client/plugins";

const API_BASE = process.env.REACT_APP_BACKEND_URL;

export const authClient = createAuthClient({
  baseURL: `${API_BASE}api/auth`,
  plugins: [polarClient(), organizationClient()],
});
