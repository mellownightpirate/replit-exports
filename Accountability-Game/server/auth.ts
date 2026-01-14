import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

declare module "express-session" {
  interface SessionData {
    passport?: { user?: number };
  }
}

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE_NAME = "connect.sid";

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function destroySession(req: Request): Promise<void> {
  return new Promise((resolve) => {
    if (req.session) {
      req.session.destroy((err) => resolve());
    } else {
      resolve();
    }
  });
}

function logoutUser(req: Request): Promise<void> {
  return new Promise((resolve) => {
    if (req.logout) {
      req.logout((err) => resolve());
    } else {
      resolve();
    }
  });
}

async function clearSessionCompletely(req: Request, res: Response): Promise<void> {
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  await logoutUser(req);
  await destroySession(req);
}

function isApiRequest(req: Request): boolean {
  return req.path.startsWith("/api/") || 
         (req.headers.accept?.includes("application/json") && !req.headers.accept?.includes("text/html")) ||
         req.xhr === true;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    name: SESSION_COOKIE_NAME,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(null, false);
    }
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const hasSessionData = req.session?.passport?.user != null;
    const hasUser = !!req.user;
    
    if (hasSessionData && !hasUser) {
      await clearSessionCompletely(req, res);
      
      if (isApiRequest(req)) {
        return res.status(401).json({ error: "Session expired. Please sign in again." });
      } else {
        return res.redirect("/auth");
      }
    }
    next();
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, displayName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        displayName: displayName || username,
        timezone: "UTC",
      });

      await storage.createVisibilitySettings({
        userId: user.id,
        shareHabits: true,
        shareHabitStatus: true,
        shareTasksTitles: false,
        shareTasksCountsOnly: true,
      });

      await storage.seedDefaultHabits(user.id);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login failed" });
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res) => {
    await clearSessionCompletely(req, res);
    res.status(200).json({ message: "Logged out successfully" });
  });

  app.get("/api/signout", async (req, res) => {
    await clearSessionCompletely(req, res);
    res.redirect("/auth");
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.user);
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err && (
      err.message?.includes("deserialize") ||
      err.message?.includes("session") ||
      err.name === "SessionError"
    )) {
      (async () => {
        await clearSessionCompletely(req, res);
        if (isApiRequest(req)) {
          return res.status(401).json({ error: "Session expired. Please sign in again." });
        } else {
          return res.redirect("/auth");
        }
      })();
      return;
    }
    next(err);
  });
}
