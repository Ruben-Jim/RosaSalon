import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit } from "lucide-react";
import type { Appointment, Customer, Service } from "@shared/schema";

interface AppointmentListProps {
  appointments: Appointment[];
  customers: Customer[];
  services: Service[];
}

export default function AppointmentList({ appointments, customers, services }: AppointmentListProps) {
  const getCustomerName = (customerId: number) => {
    return customers.find(c => c.id === customerId)?.name || "Unknown Customer";
  };

  const getServiceName = (serviceId: number) => {
    return services.find(s => s.id === serviceId)?.name || "Unknown Service";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-serif">Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {getCustomerName(appointment.customerId)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getServiceName(appointment.serviceId)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.appointmentDate).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status}
                </Badge>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </div>
          ))}
          {!appointments.length && (
            <p className="text-center text-muted-foreground py-8">
              No appointments scheduled for today
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
