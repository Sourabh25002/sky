// middleware/auth.js
import { auth } from "../utils/auth.ts";

export async function requireAuth(req, res, next) {
  try {
    // Express gives you headers as a plain object; Better Auth can use this
    const headers = req.headers;

    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
