import { betterAuth } from "better-auth";
import { pool } from "../database/db.js";

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: ["http://localhost:3000"],
});
