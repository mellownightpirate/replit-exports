import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Email schema for validation
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Route for newsletter signup
  app.post("/api/signup", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = emailSchema.parse(req.body);
      
      // In a real application, this would be integrated with ConvertKit API
      // For now, we'll just log the email and return success
      console.log(`Newsletter signup: ${validatedData.email}`);
      
      res.status(200).json({ 
        success: true, 
        message: "Email successfully subscribed" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid email format",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "An error occurred during subscription" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
