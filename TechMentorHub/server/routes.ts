import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuizSubmissionSchema, 
  insertWaitlistUserSchema,
  insertPageViewSchema,
  insertEventSchema,
  insertConversionSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import Stripe from "stripe";
import { 
  sendRedditConversion,
  trackRedditPageView,
  trackRedditLead,
  trackRedditPurchase,
  trackRedditCustomConversion
} from './reddit-conversions-api';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY environment variable is missing');
  throw new Error('Missing Stripe configuration - please check deployment secrets');
}
console.log('Stripe configuration loaded successfully');

const stripe = new Stripe(stripeKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.post("/api/quiz-submit", async (req: Request, res: Response) => {
    try {
      const data = insertQuizSubmissionSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      
      // Calculate score and determine result
      let score = 0;
      for (let i = 1; i <= 5; i++) {
        const answer = data[`q${i}` as keyof typeof data];
        if (answer) {
          score += parseInt(answer as string);
        }
      }
      
      let result = "";
      if (score >= 15) {
        result = "ready";
      } else if (score >= 10) {
        result = "almost";
      } else {
        result = "curious";
      }
      
      const submission = await storage.createQuizSubmission({
        ...data,
        score,
        result,
      });
      
      res.status(201).json({ success: true, result, submission });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid quiz submission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit quiz" });
      }
    }
  });

  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      // Validate and store in our local database
      const data = insertWaitlistUserSchema.parse({
        email: req.body.email,
        createdAt: new Date().toISOString(),
      });
      
      const waitlistUser = await storage.addToWaitlist(data);
      
      // Send to ConvertKit API
      // Note: In production, you would store your ConvertKit API key and form ID in environment variables
      try {
        // Extract optional fields from request
        const { firstName = '', quiz_result = '', source = 'website' } = req.body;
        
        // Use the numeric form ID - ConvertKit's API requires the numeric ID (not the UID)
        const convertKitFormId = '7906965';
        const convertKitApiKey = process.env.CONVERTKIT_API_KEY || 'your_api_key'; // Replace with your API key
        
        // Make sure we have an API key before attempting to send
        if (convertKitApiKey && convertKitApiKey !== 'your_api_key') {
          console.log('Attempting to send to ConvertKit with form ID:', convertKitFormId);
          
          // ConvertKit's API expects the data structure differently based on documentation
          const convertKitResponse = await fetch(`https://api.convertkit.com/v3/forms/${convertKitFormId}/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_key: convertKitApiKey,
              email: req.body.email,
              first_name: firstName,
              // Optional fields
              fields: {
                quiz_result: quiz_result || '',
                source: source || 'website'
              }
            }),
          });
          
          if (!convertKitResponse.ok) {
            const errorText = await convertKitResponse.text();
            console.error('ConvertKit API request failed:', {
              status: convertKitResponse.status,
              statusText: convertKitResponse.statusText,
              response: errorText,
              formId: convertKitFormId
            });
          } else {
            const responseData = await convertKitResponse.json();
            console.log('Successfully sent email to ConvertKit:', {
              email: req.body.email,
              conversionId: responseData.subscription?.id,
              formId: convertKitFormId
            });
          }
        } else {
          console.log('ConvertKit integration skipped - API key not configured');
        }
      } catch (convertKitError) {
        // Log the error but don't fail the request
        console.error('Error sending to ConvertKit:', convertKitError);
      }
      
      // Use the form UID for consistency in the response
      const usedFormId = '5f930f5745';
      
      // Return a response with both the local result and ConvertKit result info
      res.status(201).json({ 
        success: true, 
        waitlistUser,
        message: "Successfully added to waitlist",
        convertKit: {
          attempted: true,
          formId: usedFormId
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid email format", errors: error.errors });
      } else {
        console.error('Error in /api/waitlist:', error);
        res.status(500).json({ 
          success: false,
          message: "Failed to add to waitlist",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { amount, planName, customerEmail } = req.body;
      
      // Validate inputs
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }

      // Create payment intent options
      const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          planName: planName || "Unknown plan",
        },
      };

      // Only add receipt_email if a valid email is provided
      if (customerEmail && customerEmail.trim() !== '') {
        paymentIntentOptions.receipt_email = customerEmail.trim();
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);
      
      res.status(200).json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Error creating payment intent", 
        message: error.message 
      });
    }
  });

  // Analytics API routes
  
  // Track page views
  app.post("/api/analytics/page-view", async (req: Request, res: Response) => {
    try {
      const data = insertPageViewSchema.parse(req.body);
      const pageView = await storage.trackPageView(data);
      
      // Send to Reddit Conversions API for server-side tracking
      try {
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        // Use the client-provided conversion ID if available (for deduplication)
        // This corresponds to the conversion_id that we set in the client-side pixel
        const conversionId = req.body.conversion_id || `pageview___${Date.now()}`;
        
        await sendRedditConversion(
          'PageVisit',
          conversionId,
          typeof userIp === 'string' ? userIp : undefined,
          typeof userAgent === 'string' ? userAgent : undefined,
          { content_name: data.path }
        );
      } catch (redditApiError) {
        // Log but don't fail the request
        console.error('Error sending to Reddit Conversions API:', redditApiError);
      }

      res.status(201).json({ success: true, pageView });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid page view data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to track page view" });
      }
    }
  });

  // Track events (button clicks, form submissions, etc.)
  app.post("/api/analytics/event", async (req: Request, res: Response) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.trackEvent(data);
      res.status(201).json({ success: true, event });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to track event" });
      }
    }
  });

  // Track conversions
  app.post("/api/analytics/conversion", async (req: Request, res: Response) => {
    try {
      const data = insertConversionSchema.parse(req.body);
      const conversion = await storage.trackConversion(data);
      
      // Send to Reddit Conversions API for server-side tracking
      try {
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        // Use client-provided conversion ID for deduplication if available, otherwise generate one
        const conversionId = req.body.conversion_id || `${data.conversionType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Build event properties from conversion data
        const eventProperties = {
          // Use data fields directly for the event properties
          planName: data.planName || 'Unknown Plan',
          planPrice: data.planPrice || 0,
          email: data.email || '',
          sessionId: data.sessionId || '',
          transactionId: req.body.transaction_id || data.sessionId || `trans_${Date.now()}`,
          value: data.planPrice || 0
        };
        
        // Map the conversion type to Reddit event type
        switch (data.conversionType) {
          case 'quiz_completion':
            await sendRedditConversion(
              'Custom',
              conversionId,
              typeof userIp === 'string' ? userIp : undefined,
              typeof userAgent === 'string' ? userAgent : undefined,
              { 
                customEventName: 'quiz_completed',
                quiz_result: data.conversionType === 'quiz_completion' ? 'completed' : '',
                ...eventProperties
              }
            );
            break;
            
          case 'call_booking':
            await sendRedditConversion(
              'Lead',
              conversionId,
              typeof userIp === 'string' ? userIp : undefined,
              typeof userAgent === 'string' ? userAgent : undefined,
              {
                lead_type: 'call_booking',
                ...eventProperties
              }
            );
            break;
            
          case 'signup':
            await sendRedditConversion(
              'Lead',
              conversionId,
              typeof userIp === 'string' ? userIp : undefined,
              typeof userAgent === 'string' ? userAgent : undefined,
              {
                lead_type: 'registration',
                ...eventProperties
              }
            );
            break;
            
          case 'qualification':
            await sendRedditConversion(
              'Custom',
              conversionId,
              typeof userIp === 'string' ? userIp : undefined,
              typeof userAgent === 'string' ? userAgent : undefined,
              {
                customEventName: 'qualification_check',
                ...eventProperties
              }
            );
            break;
            
          case 'try_demo':
            await sendRedditConversion(
              'Custom',
              conversionId,
              typeof userIp === 'string' ? userIp : undefined,
              typeof userAgent === 'string' ? userAgent : undefined,
              {
                customEventName: 'try_demo',
                ...eventProperties
              }
            );
            break;
            
          case 'checkout_completed':
            // Convert the value to a number before adding it to the properties
            const numericValue = typeof eventProperties.value === 'number' ? eventProperties.value : 
              (typeof eventProperties.value === 'string' ? parseFloat(eventProperties.value as string) : 0);
              
            // Create a properties object without the value field to avoid duplication
            const { value, ...otherProps } = eventProperties;
            
            await sendRedditConversion(
              'Purchase',
              conversionId,
              typeof userIp === 'string' ? userIp : undefined,
              typeof userAgent === 'string' ? userAgent : undefined,
              {
                value: numericValue,
                currency: 'GBP',
                transaction_id: otherProps.transactionId,
                ...otherProps
              }
            );
            break;
        }
      } catch (redditApiError) {
        // Log but don't fail the request
        console.error('Error sending to Reddit Conversions API:', redditApiError);
      }
      
      res.status(201).json({ success: true, conversion });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid conversion data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to track conversion" });
      }
    }
  });

  // Update conversion status (e.g., when checkout is completed)
  app.patch("/api/analytics/conversion/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { completed } = req.body;
      
      // Get existing conversions
      const allConversions = await storage.getConversions();
      const conversion = allConversions.find(c => c.id === id);
      
      if (!conversion) {
        return res.status(404).json({ message: "Conversion not found" });
      }
      
      // Update completion status
      conversion.completed = !!completed;
      
      res.status(200).json({ success: true, conversion });
    } catch (error) {
      res.status(500).json({ message: "Failed to update conversion status" });
    }
  });

  // Analytics dashboard data endpoints
  app.get("/api/analytics/dashboard", async (req: Request, res: Response) => {
    try {
      // Parse date range params
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      const endDate = endDateStr ? new Date(endDateStr) : new Date();
      
      // Get analytics data
      const pageViews = await storage.getPageViews({ startDate, endDate });
      
      // Get conversion rates for different conversion types
      const quizCompletionRate = await storage.getConversionRate('quiz_completion', startDate, endDate);
      const checkoutStartedRate = await storage.getConversionRate('checkout_started', startDate, endDate);
      const checkoutCompletedRate = await storage.getConversionRate('checkout_completed', startDate, endDate);
      const waitlistSignupRate = await storage.getConversionRate('waitlist_signup', startDate, endDate);
      
      // Get most clicked CTA buttons
      const ctaEvents = await storage.getEvents({
        eventCategory: 'cta',
        eventType: 'click',
        startDate,
        endDate
      });
      
      // Count events by action (button name)
      const ctaClicksByAction: Record<string, number> = {};
      ctaEvents.forEach(event => {
        const action = event.eventAction;
        ctaClicksByAction[action] = (ctaClicksByAction[action] || 0) + 1;
      });
      
      // Most viewed pages
      const pageViewsByPath: Record<string, number> = {};
      pageViews.forEach(view => {
        const path = view.path;
        pageViewsByPath[path] = (pageViewsByPath[path] || 0) + 1;
      });
      
      res.status(200).json({
        success: true,
        data: {
          period: {
            startDate,
            endDate
          },
          totalPageViews: pageViews.length,
          conversionRates: {
            quizCompletion: quizCompletionRate,
            checkoutStarted: checkoutStartedRate,
            checkoutCompleted: checkoutCompletedRate,
            waitlistSignup: waitlistSignupRate
          },
          ctaClicksByAction,
          pageViewsByPath
        }
      });
    } catch (error) {
      console.error("Analytics dashboard error:", error);
      res.status(500).json({ message: "Failed to retrieve analytics data" });
    }
  });

  // Mouse tracking endpoint
  app.post("/api/analytics/mouse-tracking", async (req: Request, res: Response) => {
    try {
      const { positions } = req.body;
      
      if (!Array.isArray(positions)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Positions must be an array' 
        });
      }
      
      // Store mouse tracking data
      // In a real application, this would be stored in a database
      // Here we're just logging the first position as an example
      if (positions.length > 0) {
        // Log the first position for debugging
        console.log(`Mouse tracking: ${positions[0].type} at (${positions[0].x}, ${positions[0].y}) on ${positions[0].pageUrl}`);
        
        // Track as an event for analytics
        await storage.trackEvent({
          eventType: 'mouse',
          eventCategory: 'interaction',
          eventAction: 'mouse_batch_received',
          eventLabel: positions[0].pageUrl,
          eventValue: positions.length,
          path: positions[0].pageUrl,
          sessionId: req.body.sessionId || null
        });
      }
      
      res.json({
        success: true,
        message: `Received ${positions.length} tracking point(s)`
      });
    } catch (error) {
      console.error('Error storing mouse tracking data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to store mouse tracking data' 
      });
    }
  });

  // Test Reddit Conversions API integration
  app.get("/api/test/reddit", async (req: Request, res: Response) => {
    try {
      const redditPixelId = process.env.VITE_REDDIT_PIXEL_ID || 'a2_gtxp2aek62bn';
      
      // Test a page view conversion
      const pageViewResult = await trackRedditPageView(
        req.query.path as string || '/test-page',
        req.ip,
        req.get('User-Agent')
      );
      
      // Test a lead conversion
      const leadResult = await trackRedditLead(
        'api_test',
        req.ip,
        req.get('User-Agent')
      );
      
      // Test a purchase conversion with enhanced parameters
      const purchaseResult = await trackRedditPurchase(
        `test_purchase_${Date.now()}`,
        99.99,
        'GBP',
        req.ip,
        req.get('User-Agent'),
        {
          // Enhanced user data
          email: req.query.email as string || 'test@example.com',
          userId: 'test_user_123',
          clickId: req.query.clickId as string || 'test_click_id',
          screenWidth: 1920,
          screenHeight: 1080,
          
          // Sample product data
          products: [
            {
              id: 'product_123',
              name: 'NextChapter Premium Plan',
              category: 'Tech Mentoring'
            },
            {
              id: 'product_456',
              name: 'Career Transition Bonus',
              category: 'Coaching'
            }
          ]
        }
      );
      
      // Test a custom conversion
      const customResult = await trackRedditCustomConversion(
        'TestCustomEvent',
        `test_custom_${Date.now()}`,
        req.ip,
        req.get('User-Agent')
      );
      
      // Test qualificationCheck conversion
      const qualificationResult = await trackRedditCustomConversion(
        'qualification_check',
        `test_qualification_${Date.now()}`,
        req.ip,
        req.get('User-Agent')
      );
      
      // Test tryDemo conversion
      const tryDemoResult = await trackRedditCustomConversion(
        'try_demo',
        `test_try_demo_${Date.now()}`,
        req.ip,
        req.get('User-Agent')
      );
      
      // Test signup conversion (as a Lead type)
      const signupResult = await trackRedditLead(
        'signup_test',
        req.ip,
        req.get('User-Agent'),
        { lead_type: 'registration' }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Reddit Conversions API tests completed',
        redditPixelId,
        results: {
          pageView: pageViewResult,
          lead: leadResult,
          purchase: purchaseResult,
          custom: customResult,
          qualification: qualificationResult,
          tryDemo: tryDemoResult,
          signup: signupResult
        }
      });
    } catch (error: any) {
      console.error('Error testing Reddit Conversions API:', error);
      return res.status(500).json({
        success: false,
        message: `Error testing Reddit Conversions API: ${error.message}`,
        error: error.message
      });
    }
  });

  // Test ConvertKit integration
  app.get("/api/test/convertkit", async (req: Request, res: Response) => {
    try {
      const convertKitApiKey = process.env.CONVERTKIT_API_KEY;
      const convertKitFormId = process.env.CONVERTKIT_FORM_ID;
      
      if (!convertKitApiKey || convertKitApiKey === 'your_api_key') {
        return res.status(400).json({ 
          success: false,
          message: 'ConvertKit API key not configured',
          configured: false,
          apiKeyPresent: !!convertKitApiKey,
          formIdPresent: !!convertKitFormId
        });
      }
      
      // Test connection to ConvertKit API
      const testResponse = await fetch(`https://api.convertkit.com/v3/forms?api_key=${convertKitApiKey}`);
      const testData = await testResponse.json();
      
      // Get info about the specific form - use the numeric ID for API calls
      let formInfo = null;
      const formId = '7906965'; // Clare form numeric ID
      {
        const formResponse = await fetch(`https://api.convertkit.com/v3/forms/${formId}?api_key=${convertKitApiKey}`);
        
        if (formResponse.ok) {
          formInfo = await formResponse.json();
        } else {
          formInfo = {
            error: 'Form not found',
            statusCode: formResponse.status,
            formId: formId
          };
        }
      }
      
      return res.status(200).json({
        success: testResponse.ok,
        message: testResponse.ok ? 'ConvertKit connection successful' : 'ConvertKit connection failed',
        statusCode: testResponse.status,
        totalForms: testData.forms?.length || 0,
        formInfo: formInfo,
        apiKeyPresent: !!convertKitApiKey,
        formIdPresent: !!convertKitFormId
      });
    } catch (error: any) {
      console.error('Error testing ConvertKit connection:', error);
      return res.status(500).json({
        success: false,
        message: `Error testing ConvertKit connection: ${error.message}`,
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
