import { getIronSession, type SessionOptions } from "iron-session";
import type { Request, Response, NextFunction } from "express";

export interface SessionData {
  userId?: string;
  email?: string;
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "data_architect_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(req: Request, res: Response) {
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await getSession(req, res);
  if (!session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  (req as any).userId = session.userId;
  (req as any).email = session.email;
  next();
}
