import { users, services, customers, appointments, messages, type User, type InsertUser, type Service, type InsertService, type Customer, type InsertCustomer, type Appointment, type InsertAppointment, type Message, type InsertMessage } from "@shared/schema";
import * as bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  getMessages(): Promise<Message[]>;
  getMessagesByCustomer(customerId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private services: Map<number, Service> = new Map();
  private customers: Map<number, Customer> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private messages: Map<number, Message> = new Map();
  private currentUserId = 1;
  private currentServiceId = 1;
  private currentCustomerId = 1;
  private currentAppointmentId = 1;
  private currentMessageId = 1;

  constructor() {
    // Seed data asynchronously
    this.seedData().catch(console.error);
  }

  private async seedData() {
    // Seed admin user
    const adminExists = await this.getUserByUsername("admin");
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await this.createUser({
        username: "admin",
        password: hashedPassword,
      });
    }

    // Seed services
    const defaultServices: InsertService[] = [
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

    defaultServices.forEach(service => this.createService(service));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.category === category);
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: new Date() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const targetDate = new Date(date);
    return Array.from(this.appointments.values()).filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.toDateString() === targetDate.toDateString();
    });
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { 
      ...insertAppointment,
      appointmentDate: new Date(insertAppointment.appointmentDate),
      id, 
      createdAt: new Date() 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      const updated = { ...appointment, status };
      this.appointments.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getMessagesByCustomer(customerId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.customerId === customerId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
