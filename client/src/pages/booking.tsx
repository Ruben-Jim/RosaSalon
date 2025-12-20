import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PaymentModal } from "@/components/booking/payment-modal";
import type { Service } from "@shared/schema";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  appointmentDate: z.string().min(1, "Please select a date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(14, "Valid phone number required"),
  customerEmail: z.string().email("Valid email required"),
  specialRequests: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) {
    return numbers.length > 0 ? `(${numbers}` : "";
  }
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  }
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

export default function Booking() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<BookingForm | null>(null);
  
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: { name: string; email: string; phone: string }) => {
      const response = await apiRequest("POST", "/api/customers", customerData);
      return response.json();
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: {
      customerId: number;
      serviceId: number;
      appointmentDate: string;
      specialRequests: string;
      status: string;
      downPaymentPaid: boolean;
      totalPaid: boolean;
      paymentId?: string;
    }) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled and paid.",
      });
      form.reset();
      setSelectedService(null);
      setPendingFormData(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      appointmentDate: "",
      appointmentTime: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      specialRequests: "",
    },
  });

  const handleServiceChange = (serviceId: string) => {
    const service = services?.find(s => s.id.toString() === serviceId);
    setSelectedService(service || null);
    form.setValue("serviceId", serviceId);
  };

  // Validate form and open payment modal
  const handleBookAndPay = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Please fill all required fields",
        description: "Check the form for any missing information.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedService) {
      toast({
        title: "No service selected",
        description: "Please select a service before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Store form data and open payment modal
    setPendingFormData(form.getValues());
    setShowPaymentModal(true);
  };

  // Called after successful payment
  const handlePaymentSuccess = async (paymentId: string) => {
    if (!pendingFormData || !selectedService) return;

    try {
      // Create customer
      const customer = await createCustomerMutation.mutateAsync({
        name: pendingFormData.customerName,
        email: pendingFormData.customerEmail,
        phone: pendingFormData.customerPhone,
      });

      // Create appointment with payment info
      const appointmentDateTime = `${pendingFormData.appointmentDate}T${pendingFormData.appointmentTime}:00`;
      
      await createAppointmentMutation.mutateAsync({
        customerId: customer.id,
        serviceId: parseInt(pendingFormData.serviceId),
        appointmentDate: appointmentDateTime,
        specialRequests: pendingFormData.specialRequests || "",
        status: "confirmed",
        downPaymentPaid: true,
        totalPaid: false,
        paymentId,
      });
    } catch (error) {
      console.error("Booking error after payment:", error);
      toast({
        title: "Booking Error",
        description: "Payment was successful but there was an error creating your appointment. Please contact us.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const timeSlots = [
    "09:00", "10:30", "12:00", "13:30", "15:00", "16:30"
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground">
            Select your service and preferred time slot
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                {/* Service Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Service</FormLabel>
                        <FormControl>
                          <Select onValueChange={handleServiceChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a service..." />
                            </SelectTrigger>
                            <SelectContent>
                              {services?.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  {service.name} - ${service.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose time..." />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
                                    hour: 'numeric', 
                                    minute: '2-digit', 
                                    hour12: true 
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(555) 123-4567" 
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special requests or notes..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Summary */}
                {selectedService && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h3>
                    <div className="bg-muted p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Service Total:</span>
                        <span className="font-bold text-foreground">${selectedService.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Down Payment Due Now:</span>
                        <span className="font-bold text-primary">${selectedService.downPayment}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Remaining (pay in salon):</span>
                        <span>${(parseFloat(selectedService.price) - parseFloat(selectedService.downPayment)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book & Pay Button */}
                <Button 
                  type="button"
                  onClick={handleBookAndPay}
                  className="w-full btn-primary py-6 text-lg font-semibold"
                  disabled={createAppointmentMutation.isPending || createCustomerMutation.isPending}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {(createAppointmentMutation.isPending || createCustomerMutation.isPending) 
                    ? "Processing..." 
                    : "Book Appointment & Pay"
                  }
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {selectedService && pendingFormData && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          amount={selectedService.downPayment}
          serviceName={selectedService.name}
          customerName={pendingFormData.customerName}
          customerEmail={pendingFormData.customerEmail}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
