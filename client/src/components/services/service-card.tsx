import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="group overflow-hidden bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop"}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-serif font-bold text-white">{service.name}</h3>
        </div>
      </div>

      <CardContent className="p-5">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Service Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{service.duration} min</span>
              </div>
              <div className="text-right">
            <p className="text-2xl font-bold text-primary">${service.price}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
              <DollarSign className="w-3 h-3" />
              {service.downPayment} deposit
                </p>
              </div>
        </div>

        {/* Book Button */}
        <Link href="/booking">
          <Button className="w-full btn-primary">
            Book Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
