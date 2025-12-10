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
import { CalendarCheck, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  appointmentDate: z.string().min(1, "Please select a date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Valid email required"),
  specialRequests: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function Booking() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
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
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully scheduled.",
      });
      form.reset();
      setSelectedService(null);
    },
    onError: (error: any) => {
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

  const onSubmit = async (data: BookingForm) => {
    try {
      // First create customer
      const customer = await createCustomerMutation.mutateAsync({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
      });

      // Then create appointment
      const appointmentDateTime = `${data.appointmentDate}T${data.appointmentTime}:00`;
      
      await createAppointmentMutation.mutateAsync({
        customerId: customer.id,
        serviceId: parseInt(data.serviceId),
        appointmentDate: appointmentDateTime,
        specialRequests: data.specialRequests,
        status: "pending",
        downPaymentPaid: false,
        totalPaid: false,
      });
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  const handlePayment = async () => {
    if (!selectedService) return;
    
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: parseFloat(selectedService.downPayment)
      });
      const { clientSecret } = await response.json();
      
      toast({
        title: "Payment Processing",
        description: "This would integrate with Stripe for actual payment processing.",
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Unable to process payment at this time.",
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <Input placeholder="(555) 123-4567" {...field} />
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

                {/* Payment Section */}
                {selectedService && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Down Payment Required</h3>
                    <div className="bg-muted p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Service Total:</span>
                        <span className="font-bold text-foreground">${selectedService.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground">Down Payment:</span>
                        <span className="font-bold text-primary">${selectedService.downPayment}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Remaining (pay in salon):</span>
                        <span>${(parseFloat(selectedService.price) - parseFloat(selectedService.downPayment)).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center justify-center"
                        onClick={handlePayment}
                      >
                        <i className="fab fa-apple text-2xl mr-2"></i>
                        Apple Pay
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center justify-center"
                        onClick={handlePayment}
                      >
                        <i className="fab fa-google text-2xl mr-2"></i>
                        Google Pay
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center justify-center"
                        onClick={handlePayment}
                      >
                        <CreditCard className="w-6 h-6 mr-2" />
                        Card
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-primary py-4 text-lg font-semibold"
                  disabled={createAppointmentMutation.isPending}
                >
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
