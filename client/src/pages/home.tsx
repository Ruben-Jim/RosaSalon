import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar, Play, Star } from "lucide-react";
import { Link } from "wouter";
import ServiceCard from "@/components/services/service-card";
import type { Service } from "@shared/schema";

export default function Home() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const servicesByCategory = {
    hair: services?.filter(s => s.category === "hair") || [],
    eye: services?.filter(s => s.category === "eye") || [],
    special: services?.filter(s => s.category === "special") || [],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
                Your Beauty,
                <span className="text-primary block">Our Passion</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience professional hair styling, eyebrow artistry, and beauty services in our modern salon. Book your appointment today and let us enhance your natural beauty.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button className="btn-primary px-8 py-4 text-lg font-medium">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <Button variant="outline" className="px-8 py-4 text-lg font-medium">
                  <Play className="w-5 h-5 mr-2" />
                  View Services
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Modern beauty salon interior" 
                className="rounded-2xl shadow-2xl w-full" 
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-border">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Star className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">500+ Happy Clients</p>
                    <p className="text-muted-foreground text-sm">5.0 Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional beauty services tailored to enhance your unique style and confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard
              title="Hair Services"
              description="Professional cuts, styling, and treatments"
              icon="scissors"
              services={servicesByCategory.hair}
            />
            <ServiceCard
              title="Eye Services"
              description="Eyebrow shaping and enhancement"
              icon="eye"
              services={servicesByCategory.eye}
            />
            <ServiceCard
              title="Special Services"
              description="Unique cuts and styling services"
              icon="sparkles"
              services={servicesByCategory.special}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-serif font-bold mb-4">Bella Beauty Salon</h3>
              <p className="text-background/80 mb-6 max-w-md">
                Your trusted beauty destination for professional hair styling, eyebrow artistry, and personalized beauty services.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-background/80 hover:text-background transition-colors">
                  <i className="fab fa-facebook-f text-xl"></i>
                </a>
                <a href="#" className="text-background/80 hover:text-background transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-background/80 hover:text-background transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-background/80">
                <p><i className="fas fa-map-marker-alt mr-2"></i>123 Beauty Lane, City, ST 12345</p>
                <p><i className="fas fa-phone mr-2"></i>(555) 123-4567</p>
                <p><i className="fas fa-envelope mr-2"></i>hello@bellabeauty.com</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <div className="space-y-2 text-background/80">
                <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                <p>Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: 10:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>

          <div className="border-t border-background/20 mt-12 pt-8 text-center">
            <p className="text-background/80">&copy; 2024 Bella Beauty Salon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
