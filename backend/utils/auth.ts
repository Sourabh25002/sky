import * as dotenv from "dotenv";
dotenv.config();
import { betterAuth } from "better-auth";
import { pool } from "../database/db.js";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const trustedOrigins = process.env.CORS_ORIGIN
  ? [process.env.CORS_ORIGIN]
  : undefined;

const checkoutSuccessUrl = process.env.CORS_ORIGIN;

// POLAR CLIENT
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox", // or 'production'
});

// AUTH CONFIGURATION
export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins,

  // AUTO CREATE TABLES
  migrate: {
    enabled: true, // Creates user/session/account tables
  },

  // USER DELETION HOOK
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user, request) => {
        await polarClient.customers.deleteExternal({
          externalId: user.id,
        });
      },
    },
  },

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            { productId: "17ee1f9d-869a-4684-b86a-64f19443d31c", slug: "pro" },
          ],
          successUrl: checkoutSuccessUrl,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
        }),
      ],
    }),
  ],
});
