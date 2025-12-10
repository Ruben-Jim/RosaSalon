import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { insertAppointmentSchema, insertCustomerSchema, insertMessageSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized. Please log in." });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    // Ensure we're sending JSON
    res.setHeader("Content-Type", "application/json");
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "An error occurred during authentication" 
        });
      }
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password" 
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: "An error occurred during login" 
          });
        }
        return res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username 
          } 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        authenticated: true, 
        user: { 
          id: (req.user as any)?.id, 
          username: (req.user as any)?.username 
        } 
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching services: " + error.message });
    }
  });

  app.get("/api/services/category/:category", async (req, res) => {
    try {
      const services = await storage.getServicesByCategory(req.params.category);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching services: " + error.message });
    }
  });

  // Public endpoint to find customer by email (for customer messages)
  app.get("/api/customers/find/:email", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      const customer = customers.find(c => c.email.toLowerCase() === req.params.email.toLowerCase());
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ message: "Error finding customer: " + error.message });
    }
  });

  // Customers routes (protected)
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching customers: " + error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating customer: " + error.message });
    }
  });

  // Appointments routes (protected)
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching appointments: " + error.message });
    }
  });

  app.get("/api/appointments/date/:date", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByDate(req.params.date);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching appointments: " + error.message });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating appointment: " + error.message });
    }
  });

  app.patch("/api/appointments/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const appointment = await storage.updateAppointmentStatus(parseInt(req.params.id), status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating appointment: " + error.message });
    }
  });

  // Messages routes (protected)
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching messages: " + error.message });
    }
  });

  // Customer messages endpoint (public - customers can view their own messages)
  app.get("/api/messages/customer/:customerId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByCustomer(parseInt(req.params.customerId));
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching messages: " + error.message });
    }
  });

  // Allow customers to post messages (public), but admin messages still require auth
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      // Only allow customers to send messages marked as fromCustomer=true
      // Admin messages (isFromCustomer=false) require authentication
      if (!messageData.isFromCustomer) {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized. Admin messages require login." });
        }
      }
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating message: " + error.message });
    }
  });

  // Admin-only messages endpoint (protected)
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating message: " + error.message });
    }
  });

  // Mock payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      // Mock Stripe payment intent
      const paymentIntent = {
        client_secret: `pi_mock_${Date.now()}_secret`,
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        status: "requires_payment_method"
      };
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
