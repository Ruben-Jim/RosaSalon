// server/index.ts
import express2 from "express";
import session from "express-session";
import passport2 from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// server/routes.ts
import { createServer } from "http";
import passport from "passport";

// server/storage.ts
import * as bcrypt from "bcryptjs";
var MemStorage = class {
  users = /* @__PURE__ */ new Map();
  services = /* @__PURE__ */ new Map();
  customers = /* @__PURE__ */ new Map();
  appointments = /* @__PURE__ */ new Map();
  messages = /* @__PURE__ */ new Map();
  currentUserId = 1;
  currentServiceId = 1;
  currentCustomerId = 1;
  currentAppointmentId = 1;
  currentMessageId = 1;
  constructor() {
    this.seedData().catch(console.error);
  }
  async seedData() {
    const adminExists = await this.getUserByUsername("admin");
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await this.createUser({
        username: "admin",
        password: hashedPassword
      });
    }
    const defaultServices = [
      // Hair Services
      { name: "Precision Cut & Style", category: "hair", price: "85.00", downPayment: "25.00", duration: 60, description: "Professional haircut and styling" },
      { name: "Color & Highlights", category: "hair", price: "150.00", downPayment: "50.00", duration: 120, description: "Hair coloring and highlighting" },
      { name: "Blowout Styling", category: "hair", price: "45.00", downPayment: "15.00", duration: 45, description: "Professional blowout and styling" },
      // Eye Services  
      { name: "Eyebrow Threading", category: "eye", price: "35.00", downPayment: "10.00", duration: 30, description: "Precise eyebrow shaping" },
      { name: "Brow Tinting", category: "eye", price: "55.00", downPayment: "20.00", duration: 45, description: "Eyebrow tinting service" },
      { name: "Lash Extensions", category: "eye", price: "120.00", downPayment: "40.00", duration: 90, description: "Professional lash extensions" },
      // Special Services
      { name: "Curtain Bangs", category: "special", price: "65.00", downPayment: "20.00", duration: 45, description: "Trendy curtain bang cut" },
      { name: "Hair Treatment", category: "special", price: "75.00", downPayment: "25.00", duration: 60, description: "Deep conditioning treatment" },
      { name: "Bridal Package", category: "special", price: "250.00", downPayment: "75.00", duration: 180, description: "Complete bridal styling package" }
    ];
    defaultServices.forEach((service) => this.createService(service));
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getServices() {
    return Array.from(this.services.values());
  }
  async getServicesByCategory(category) {
    return Array.from(this.services.values()).filter((service) => service.category === category);
  }
  async getService(id) {
    return this.services.get(id);
  }
  async createService(insertService) {
    const id = this.currentServiceId++;
    const service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }
  async getCustomers() {
    return Array.from(this.customers.values());
  }
  async getCustomer(id) {
    return this.customers.get(id);
  }
  async createCustomer(insertCustomer) {
    const id = this.currentCustomerId++;
    const customer = {
      ...insertCustomer,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }
  async getAppointments() {
    return Array.from(this.appointments.values());
  }
  async getAppointmentsByDate(date) {
    const targetDate = new Date(date);
    return Array.from(this.appointments.values()).filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.toDateString() === targetDate.toDateString();
    });
  }
  async getAppointment(id) {
    return this.appointments.get(id);
  }
  async createAppointment(insertAppointment) {
    const id = this.currentAppointmentId++;
    const appointment = {
      ...insertAppointment,
      appointmentDate: new Date(insertAppointment.appointmentDate),
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.appointments.set(id, appointment);
    return appointment;
  }
  async updateAppointmentStatus(id, status) {
    const appointment = this.appointments.get(id);
    if (appointment) {
      const updated = { ...appointment, status };
      this.appointments.set(id, updated);
      return updated;
    }
    return void 0;
  }
  async getMessages() {
    return Array.from(this.messages.values());
  }
  async getMessagesByCustomer(customerId) {
    return Array.from(this.messages.values()).filter((message) => message.customerId === customerId);
  }
  async createMessage(insertMessage) {
    const id = this.currentMessageId++;
    const message = {
      ...insertMessage,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.messages.set(id, message);
    return message;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  // hair
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  // in minutes
  description: text("description"),
  image: text("image")
  // URL to service image
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  serviceId: integer("service_id").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").notNull().default("pending"),
  // pending, confirmed, completed, cancelled
  specialRequests: text("special_requests"),
  downPaymentPaid: boolean("down_payment_paid").default(false),
  totalPaid: boolean("total_paid").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  message: text("message").notNull(),
  isFromCustomer: boolean("is_from_customer").notNull().default(true),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertServiceSchema = createInsertSchema(services).omit({
  id: true
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true
});
var insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true
}).extend({
  appointmentDate: z.string()
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// server/routes.ts
var requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized. Please log in." });
};
async function registerRoutes(app2) {
  app2.post("/api/login", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    passport.authenticate("local", (err, user, info) => {
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
      req.logIn(user, (err2) => {
        if (err2) {
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
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });
  app2.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        authenticated: true,
        user: {
          id: req.user?.id,
          username: req.user?.username
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  app2.get("/api/services", async (req, res) => {
    try {
      const services2 = await storage.getServices();
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services: " + error.message });
    }
  });
  app2.get("/api/services/category/:category", async (req, res) => {
    try {
      const services2 = await storage.getServicesByCategory(req.params.category);
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services: " + error.message });
    }
  });
  app2.get("/api/customers/find/:email", async (req, res) => {
    try {
      const customers2 = await storage.getCustomers();
      const customer = customers2.find((c) => c.email.toLowerCase() === req.params.email.toLowerCase());
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error finding customer: " + error.message });
    }
  });
  app2.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const customers2 = await storage.getCustomers();
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customers: " + error.message });
    }
  });
  app2.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Error creating customer: " + error.message });
    }
  });
  app2.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments2 = await storage.getAppointments();
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments: " + error.message });
    }
  });
  app2.get("/api/appointments/date/:date", requireAuth, async (req, res) => {
    try {
      const appointments2 = await storage.getAppointmentsByDate(req.params.date);
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments: " + error.message });
    }
  });
  app2.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Error creating appointment: " + error.message });
    }
  });
  app2.patch("/api/appointments/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const appointment = await storage.updateAppointmentStatus(parseInt(req.params.id), status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Error updating appointment: " + error.message });
    }
  });
  app2.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages2 = await storage.getMessages();
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages: " + error.message });
    }
  });
  app2.get("/api/messages/customer/:customerId", async (req, res) => {
    try {
      const messages2 = await storage.getMessagesByCustomer(parseInt(req.params.customerId));
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages: " + error.message });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      if (!messageData.isFromCustomer) {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Unauthorized. Admin messages require login." });
        }
      }
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Error creating message: " + error.message });
    }
  });
  app2.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Error creating message: " + error.message });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = {
        client_secret: `pi_mock_${Date.now()}_secret`,
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd",
        status: "requires_payment_method"
      };
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var base = process.env.GITHUB_PAGES === "true" ? "/RosaSalon/" : "/";
var vite_config_default = defineConfig({
  base,
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    vite.middlewares(req, res, next);
  });
  app2.use("*", async (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import * as bcrypt2 from "bcryptjs";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "salon-sync-pro-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  })
);
app.use(passport2.initialize());
app.use(passport2.session());
passport2.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      const isPasswordValid = await bcrypt2.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);
passport2.serializeUser((user, done) => {
  done(null, user.id);
});
passport2.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      log(`Port ${port} is already in use. Try setting a different port with: PORT=3001 npm run dev`);
      process.exit(1);
    } else {
      throw err;
    }
  });
})();
