import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message, Customer } from "@shared/schema";

export default function Messages() {
  const { toast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 5000, // Refresh every 5 seconds for "real-time" effect
  });

  const customerMessages = messages?.filter(m => 
    selectedCustomerId ? m.customerId === selectedCustomerId : false
  ) || [];

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { customerId: number; message: string; isFromCustomer: boolean }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!selectedCustomerId || !newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      customerId: selectedCustomerId,
      message: newMessage.trim(),
      isFromCustomer: false, // This is from salon staff
    });
  };

  const selectedCustomer = customers?.find(c => c.id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Customer Messages</h1>
          <p className="text-xl text-muted-foreground">
            Real-time communication with your clients
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-serif font-semibold">Customers</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customers?.map((customer) => {
                    const customerMessageCount = messages?.filter(m => m.customerId === customer.id).length || 0;
                    const isSelected = selectedCustomerId === customer.id;
                    
                    return (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected 
                            ? "bg-primary/10 border-primary" 
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                          {customerMessageCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {customerMessageCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!customers?.length && (
                    <p className="text-center text-muted-foreground py-4">No customers found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              {selectedCustomer ? (
                <>
                  {/* Message Header */}
                  <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                          <User className="text-primary w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{selectedCustomer.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Online</span>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {customerMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className="max-w-xs lg:max-w-md">
                            <div 
                              className={`p-3 rounded-lg ${
                                message.isFromCustomer 
                                  ? 'bg-muted rounded-tl-none' 
                                  : 'bg-primary text-primary-foreground rounded-tr-none'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground mt-1 ${
                              message.isFromCustomer ? '' : 'text-right'
                            }`}>
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                      {!customerMessages.length && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No messages yet</p>
                          <p className="text-sm text-muted-foreground">Start a conversation!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-6 border-t border-border">
                    <div className="flex items-center space-x-4">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="btn-primary"
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                      Select a Customer
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a customer from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
