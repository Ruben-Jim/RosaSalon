import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import AppointmentList from "@/components/dashboard/appointment-list";
import StatsCard from "@/components/dashboard/stats-card";
import type { Appointment, Customer, Service, Message } from "@shared/schema";

type DashboardTab = "appointments" | "customers" | "services";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("appointments");

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
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">Service Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services?.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <div>
                          <h4 className="font-semibold text-foreground">{service.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{service.category} • {service.duration} min</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${service.price}</p>
                          <p className="text-xs text-muted-foreground">Down: ${service.downPayment}</p>
                        </div>
                      </div>
                    ))}
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
    </div>
  );
}
