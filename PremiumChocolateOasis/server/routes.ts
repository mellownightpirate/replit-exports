import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertParticipantSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import Stripe from "stripe";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // Endpoint to handle email subscription
  app.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscriber = await storage.getSubscriberByEmail(validatedData.email);
      if (existingSubscriber) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      
      // Add new subscriber
      const subscriber = await storage.createSubscriber({
        email: validatedData.email,
        createdAt: new Date().toISOString(),
      });
      
      return res.status(201).json({ 
        message: "Successfully subscribed! You'll receive 10% off your first order.",
        subscriber 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid email format",
          errors: error.errors 
        });
      }
      
      console.error("Error saving subscriber:", error);
      return res.status(500).json({ message: "Failed to subscribe. Please try again." });
    }
  });

  // Endpoint to handle participant form submissions
  app.post("/api/participate", async (req, res) => {
    try {
      const validatedData = insertParticipantSchema.parse(req.body);
      
      // Add new participant
      const participant = await storage.createParticipant({
        ...validatedData,
        createdAt: new Date().toISOString(),
      });
      
      return res.status(201).json({ 
        message: "Thank you for joining our movement! We'll be in touch soon.",
        participant 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid form data",
          errors: error.errors 
        });
      }
      
      console.error("Error saving participant:", error);
      return res.status(500).json({ message: "Failed to submit form. Please try again." });
    }
  });

  // Endpoint to get all participants (for admin use)
  app.get("/api/participants", async (req, res) => {
    try {
      const participants = await storage.getAllParticipants();
      return res.status(200).json({ participants });
    } catch (error) {
      console.error("Error retrieving participants:", error);
      return res.status(500).json({ message: "Failed to retrieve participants." });
    }
  });
  
  // Stripe payment endpoint for funding the chocolate bar production
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount = 5 } = req.body;
      
      if (!amount || amount < 1) {
        return res.status(400).json({ 
          error: "Invalid amount. Please provide a positive amount." 
        });
      }
      
      // Convert amount to pence (cents)
      const amountInPence = Math.round(amount * 100);
      
      // Create a PaymentIntent with the specified amount - only allow card payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPence,
        currency: "gbp",
        payment_method_types: ['card'], // Only allow card payments
        metadata: {
          purpose: "Free Bar Chocolate Production Funding"
        },
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        amount: amountInPence,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });
  
  // Simple Stripe Checkout session endpoint
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { quantity = 1, product = 'single' } = req.body;
      
      // Configure product options
      const products = {
        single: {
          name: "Free Bar Chocolate - Single",
          price: 2199, // £21.99
          image: "https://media.istockphoto.com/id/1316460605/photo/chocolate-bars-stack-dark-chocolate-close-up-chocolate-background.jpg?b=1&s=612x612&w=0&k=20&c=oCJp2KHKpGg61FoZFYS1aUDh0gTqeIbNgpHyiRF0MWw=",
        },
        box: {
          name: "Free Bar Chocolate - Box of 6",
          price: 12000, // £120
          image: "https://media.istockphoto.com/id/1316460605/photo/chocolate-bars-stack-dark-chocolate-close-up-chocolate-background.jpg?b=1&s=612x612&w=0&k=20&c=oCJp2KHKpGg61FoZFYS1aUDh0gTqeIbNgpHyiRF0MWw=",
        }
      };
      
      const selectedProduct = products[product as keyof typeof products] || products.single;
      const shippingCost = 500; // £5 shipping
      
      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: selectedProduct.name,
                images: [selectedProduct.image],
              },
              unit_amount: selectedProduct.price,
            },
            quantity: quantity,
          },
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: "Shipping",
                description: "Standard shipping"
              },
              unit_amount: shippingCost,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/checkout`,
        shipping_address_collection: {
          allowed_countries: ["GB", "US", "CA"],
        },
      });

      res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
