import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvitationSchema } from "@shared/schema";
import { registerAnalyticsRoutes } from "./analytics-routes-v2";
import { registerAnalyticsRoutesV3 } from "./analytics-routes-v3";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register analytics V3 routes (new goal-oriented system)
  registerAnalyticsRoutesV3(app);
  
  // Keep V2 routes for backwards compatibility
  registerAnalyticsRoutes(app);
  // Invitation submission endpoint
  // POST /api/submit-invitation
  app.post("/api/submit-invitation", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertInvitationSchema.parse(req.body);
      
      // Store the invitation
      const invitation = await storage.createInvitation(validatedData);
      
      console.log(`✅ New invitation request from: ${invitation.name} (${invitation.email})`);
      
      res.status(200).json({ 
        success: true, 
        message: "Thank you for your invitation request. We will be in touch if there is a good fit.",
        id: invitation.id
      });
    } catch (error) {
      console.error("❌ Error processing invitation:", error);
      res.status(400).json({ 
        success: false, 
        message: "There was an error processing your request. Please try again." 
      });
    }
  });

  // Admin endpoint to view all submissions
  // GET /api/submissions
  // Access this at: https://your-repl-url.replit.app/api/submissions
  app.get("/api/submissions", async (req, res) => {
    try {
      const invitations = await storage.getAllInvitations();
      res.status(200).json({
        total: invitations.length,
        submissions: invitations
      });
    } catch (error) {
      console.error("❌ Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
