import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Quote, MapPin, Scissors } from "lucide-react";
import { Link } from "wouter";
import ServiceCard from "@/components/services/service-card";
import type { Service } from "@shared/schema";

// Customer reviews - customize these with real reviews
const reviews = [
  {
    id: 1,
    name: "Maria G.",
    rating: 5,
    text: "Best salon in Fresno! The stylists really listen to what you want and deliver amazing results. I've been coming here for years and always leave feeling beautiful.",
    date: "2 weeks ago",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Jennifer L.",
    rating: 5,
    text: "Amazing experience! My balayage turned out exactly how I wanted it. The staff is so friendly and professional. Highly recommend KB Salon!",
    date: "1 month ago",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Ashley T.",
    rating: 5,
    text: "I drove all the way from Clovis because this salon is worth it! The attention to detail is incredible. My hair has never looked better.",
    date: "3 weeks ago",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sarah M.",
    rating: 5,
    text: "Finally found my go-to salon! The deep conditioning treatment brought my damaged hair back to life. Thank you KB Salon!",
    date: "1 week ago",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
  },
];

export default function Home() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Filter to only show hair services
  const hairServices = services?.filter(s => s.category === "hair") || [];

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
                Experience professional hair styling and treatments at KB Salon in Fresno. Book your appointment today and let us enhance your natural beauty.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button className="btn-primary px-8 py-4 text-lg font-medium">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="px-8 py-4 text-lg font-medium"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Scissors className="w-5 h-5 mr-2" />
                  View Services
                </Button>
              </div>
              <a 
                href="https://maps.app.goo.gl/ByG3q1EDYxEt8tXr9"
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center gap-2 mt-6 text-muted-foreground hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>1661 E Shields Ave, Fresno, CA 93704</span>
              </a>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="KB Salon interior" 
                className="rounded-2xl shadow-2xl w-full" 
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-border">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Star className="text-primary w-6 h-6 fill-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">500+ Happy Clients</p>
                    <p className="text-muted-foreground text-sm">5.0 Rating on Google</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Our Hair Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional hair styling services tailored to enhance your unique style and confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hairServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Read reviews from our satisfied customers in Fresno
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">5.0</span>
              <span className="text-muted-foreground">based on Google Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={review.image} 
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{review.name}</h4>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/20" />
                      <p className="text-muted-foreground pl-4">{review.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a 
              href="https://maps.app.goo.gl/ByG3q1EDYxEt8tXr9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              See all reviews on Google
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-serif font-bold mb-4">KB Salon</h3>
              <p className="text-background/80 mb-6 max-w-md">
                Your trusted beauty destination in Fresno for professional hair styling and personalized beauty services.
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
                <a 
                  href="https://maps.app.goo.gl/ByG3q1EDYxEt8tXr9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:text-background transition-colors"
                >
                  <i className="fas fa-map-marker-alt mr-2"></i>1661 E Shields Ave
                  <span className="block pl-5">Fresno, CA 93704</span>
                </a>
                <p><i className="fas fa-phone mr-2"></i>(559) 123-4567</p>
                <p><i className="fas fa-envelope mr-2"></i>hello@kbsalon.com</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <div className="space-y-2 text-background/80">
                <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                <p>Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          <div className="border-t border-background/20 mt-12 pt-8 text-center">
            <p className="text-background/80">&copy; 2024 KB Salon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
