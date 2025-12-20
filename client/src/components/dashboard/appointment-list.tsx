import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, MoreVertical, CheckCircle, XCircle, Clock, Trash2, DollarSign } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PaymentCollectionModal } from "./payment-collection-modal";
import type { Appointment, Customer, Service } from "@shared/schema";

interface AppointmentListProps {
  appointments: Appointment[];
  customers: Customer[];
  services: Service[];
}

export default function AppointmentList({ appointments, customers, services }: AppointmentListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
    service: Service | null;
    customer: Customer | null;
  }>({ isOpen: false, appointment: null, service: null, customer: null });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update appointment");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment updated",
        description: "The appointment status has been changed.",
      });
    },
    onError: (error: Error) => {
      console.error("Update status error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment status.",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete appointment");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment deleted",
        description: "The appointment has been removed.",
      });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const handleDelete = (appointmentId: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleCollectPayment = (appointment: Appointment) => {
    const service = services.find(s => s.id === appointment.serviceId) || null;
    const customer = customers.find(c => c.id === appointment.customerId) || null;
    setPaymentModal({ isOpen: true, appointment, service, customer });
  };

  const getRemainingBalance = (appointment: Appointment) => {
    const service = services.find(s => s.id === appointment.serviceId);
    if (!service) return "0.00";
    return (parseFloat(service.price) - parseFloat(service.downPayment)).toFixed(2);
  };

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
                {appointment.totalPaid ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Paid
                  </Badge>
                ) : appointment.downPaymentPaid ? (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Partial
                  </Badge>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(appointment.id, "confirmed")}
                      disabled={appointment.status === "confirmed"}
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Confirm
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(appointment.id, "pending")}
                      disabled={appointment.status === "pending"}
                    >
                      <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                      Mark Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(appointment.id, "completed")}
                      disabled={appointment.status === "completed"}
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                      Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(appointment.id, "cancelled")}
                      disabled={appointment.status === "cancelled"}
                    >
                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      Cancel
                    </DropdownMenuItem>
                    {!appointment.totalPaid && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleCollectPayment(appointment)}
                          className="text-green-600 focus:text-green-600"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Collect ${getRemainingBalance(appointment)}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      {/* Payment Collection Modal */}
      <PaymentCollectionModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, appointment: null, service: null, customer: null })}
        appointment={paymentModal.appointment}
        service={paymentModal.service}
        customer={paymentModal.customer}
      />
    </Card>
  );
}
