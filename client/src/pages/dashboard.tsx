import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Settings, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import AppointmentList from "@/components/dashboard/appointment-list";
import StatsCard from "@/components/dashboard/stats-card";
import { ServiceFormModal } from "@/components/dashboard/service-form-modal";
import { useToast } from "@/hooks/use-toast";
import type { Appointment, Customer, Service, Message } from "@shared/schema";

type DashboardTab = "appointments" | "customers" | "services";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("appointments");
  const [serviceModal, setServiceModal] = useState<{ isOpen: boolean; service: Service | null }>({
    isOpen: false,
    service: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const todayDate = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments?.filter(apt => 
    new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
  ) || [];

  const totalRevenue = todaysAppointments.reduce((sum, apt) => {
    const service = services?.find(s => s.id === apt.serviceId);
    return sum + (service ? parseFloat(service.price) : 0);
  }, 0);

  const recentMessages = messages?.slice(-3) || [];

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to delete service");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Service deleted", description: "The service has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteService = (service: Service) => {
    if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const tabs = [
    { id: "appointments" as const, label: "Appointments", icon: Calendar },
    { id: "customers" as const, label: "Customers", icon: Users },
    { id: "services" as const, label: "Services", icon: Settings },
  ];

  if (appointmentsLoading || customersLoading || servicesLoading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Salon Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage appointments, customers, and services
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "secondary"}
                className={activeTab === tab.id ? "btn-primary" : ""}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === "appointments" && (
              <AppointmentList 
                appointments={todaysAppointments}
                customers={customers || []}
                services={services || []}
              />
            )}
            
            {activeTab === "customers" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">Customer Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customers?.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <div>
                          <h4 className="font-semibold text-foreground">{customer.name}</h4>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Joined: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!customers?.length && (
                      <p className="text-center text-muted-foreground py-8">No customers found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "services" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-serif">Service Management</CardTitle>
                  <Button 
                    onClick={() => setServiceModal({ isOpen: true, service: null })}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services?.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center space-x-4">
                          {service.image && (
                            <img 
                              src={service.image} 
                              alt={service.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-foreground">{service.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{service.category} • {service.duration} min</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-bold text-primary">${service.price}</p>
                            <p className="text-xs text-muted-foreground">Down: ${service.downPayment}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setServiceModal({ isOpen: true, service })}
                            >
                              <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteService(service)}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!services?.length && (
                      <p className="text-center text-muted-foreground py-8">No services found. Add your first service!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StatsCard 
              todayRevenue={totalRevenue}
              appointmentCount={todaysAppointments.length}
              newCustomers={customers?.filter(c => 
                c.createdAt && new Date(c.createdAt).toDateString() === new Date().toDateString()
              ).length || 0}
            />

            {/* Recent Messages Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMessages.map((message) => {
                    const customer = customers?.find(c => c.id === message.customerId);
                    return (
                      <div key={message.id} className="p-3 bg-background rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-foreground text-sm">
                            {customer?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                      </div>
                    );
                  })}
                  {!recentMessages.length && (
                    <p className="text-center text-muted-foreground py-4">No recent messages</p>
                  )}
                </div>
                <Link href="/messages">
                  <Button className="w-full mt-4 btn-primary">
                    View All Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={serviceModal.isOpen}
        onClose={() => setServiceModal({ isOpen: false, service: null })}
        service={serviceModal.service}
      />
    </div>
  );
}
