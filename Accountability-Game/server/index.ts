import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

let dbHealthy = true;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const port = parseInt(process.env.PORT || "5000", 10);
  const nodeEnv = process.env.NODE_ENV || "development";
  
  log(`Starting server...`);
  log(`NODE_ENV: ${nodeEnv}`);
  log(`PORT: ${port}`);
  log(`DATABASE_URL: ${process.env.DATABASE_URL ? "configured" : "NOT SET"}`);
  
  // Test database connection
  try {
    const { pool } = await import("./db");
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    log(`Database connection: OK`);
    dbHealthy = true;
  } catch (error) {
    log(`Database connection: FAILED - ${error}`);
    dbHealthy = false;
  }

  // Health check route - must be before auth middleware
  app.get("/health", (_req, res) => {
    res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: dbHealthy ? "connected" : "disconnected",
      uptime: process.uptime(),
    });
  });

  await registerRoutes(httpServer, app);

  // Start email worker
  try {
    const { startEmailWorker } = await import("./email");
    startEmailWorker();
  } catch (err) {
    log(`Email worker failed to start: ${err}`);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error: ${status} - ${message}`);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (nodeEnv === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`Server ready and serving on port ${port}`);
    },
  );
})();
