import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck, CreditCard, Apple, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

const bookingFormSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  appointmentDate: z.string().min(1, "Please select a date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(14, "Valid phone number required"),
  customerEmail: z.string().email("Valid email required"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

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

export default function BookingForm() {
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
        description: "Your appointment has been successfully scheduled. Please complete the down payment.",
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

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
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

  const onSubmit = async (data: BookingFormData) => {
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
        specialRequests: data.specialRequests || "",
        status: "pending",
        downPaymentPaid: false,
        totalPaid: false,
      });
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  const handlePayment = async (method: string) => {
    if (!selectedService) {
      toast({
        title: "No Service Selected",
        description: "Please select a service before proceeding with payment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: parseFloat(selectedService.downPayment)
      });
      const { clientSecret } = await response.json();
      
      toast({
        title: "Payment Processing",
        description: `Processing ${method} payment for $${selectedService.downPayment} down payment. This would integrate with ${method} payment processor.`,
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const timeSlots = [
    "09:00", "10:30", "12:00", "13:30", "15:00", "16:30"
  ];

  const remainingAmount = selectedService 
    ? (parseFloat(selectedService.price) - parseFloat(selectedService.downPayment)).toFixed(2)
    : "0.00";

  return (
    <Card className="bg-card rounded-2xl shadow-xl border border-border">
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Select Hair Service
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={handleServiceChange} value={field.value}>
                      <SelectTrigger className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
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

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      Preferred Date
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        {...field} 
                      />
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
                    <FormLabel className="text-sm font-semibold text-foreground">
                      Preferred Time
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
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
                    <FormLabel className="text-sm font-semibold text-foreground">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        {...field} 
                      />
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
                    <FormLabel className="text-sm font-semibold text-foreground">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="(555) 123-4567" 
                        className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
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
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="your.email@example.com" 
                      className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      {...field} 
                    />
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
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Special Requests (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requests or notes..." 
                      rows={3}
                      className="w-full p-4 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
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
                    <span>${remainingAmount}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex items-center justify-center p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                    onClick={() => handlePayment("Apple Pay")}
                  >
                    <Apple className="w-6 h-6 mr-2" />
                    <span>Apple Pay</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex items-center justify-center p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                    onClick={() => handlePayment("Google Pay")}
                  >
                    <Smartphone className="w-6 h-6 mr-2" />
                    <span>Google Pay</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex items-center justify-center p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                    onClick={() => handlePayment("Card")}
                  >
                    <CreditCard className="w-6 h-6 mr-2" />
                    <span>Card</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full btn-primary py-4 rounded-lg text-lg font-semibold"
              disabled={createAppointmentMutation.isPending || createCustomerMutation.isPending}
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              {(createAppointmentMutation.isPending || createCustomerMutation.isPending) 
                ? "Booking..." 
                : "Book Appointment & Pay Down Payment"
              }
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
