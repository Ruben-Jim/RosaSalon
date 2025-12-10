import { Scissors, Eye, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: "scissors" | "eye" | "sparkles";
  services: Service[];
}

const iconMap = {
  scissors: Scissors,
  eye: Eye,
  sparkles: Sparkles,
};

export default function ServiceCard({ title, description, icon, services }: ServiceCardProps) {
  const IconComponent = iconMap[icon];

  return (
    <Card className="service-card bg-background border border-border shadow-lg">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="text-primary w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex justify-between items-center p-4 bg-card rounded-lg border border-border"
            >
              <div>
                <h4 className="font-semibold text-foreground">{service.name}</h4>
                <p className="text-sm text-muted-foreground">{service.duration} min</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">${service.price}</p>
                <p className="text-xs text-muted-foreground">
                  Down payment: ${service.downPayment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
