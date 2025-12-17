// middleware/auth.js
import { auth } from "../better-auth.js"; // wherever you configured Better Auth
import { fromNodeHeaders } from "@better-auth/node"; // or correct helper from docs

export async function requireAuth(req, res, next) {
  try {
    // Convert Express headers to Better Auth Headers
    const headers = fromNodeHeaders(req.headers);

    // Get session (cookie or Bearer token)
    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach current user to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
