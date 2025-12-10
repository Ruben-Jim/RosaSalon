import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

export default function CustomerMessages() {
  const { toast } = useToast();
  const [customerEmail, setCustomerEmail] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);

  // Get customer by email
  const { data: customer, refetch: refetchCustomer } = useQuery({
    queryKey: customerEmail ? [`/api/customers/find/${encodeURIComponent(customerEmail)}`] : [],
    queryFn: async () => {
      const res = await fetch(`/api/customers/find/${encodeURIComponent(customerEmail)}`, { 
        credentials: "include" 
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: false, // Only fetch when manually triggered
  });

  // Get messages for the customer
  const { data: messages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: customerId ? [`/api/messages/customer/${customerId}`] : [],
    queryFn: async () => {
      const res = await fetch(`/api/messages/customer/${customerId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!customerId,
    refetchInterval: 5000, // Refresh every 5 seconds for "real-time" effect
  });

  const handleFindCustomer = async () => {
    if (!customerEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const result = await refetchCustomer();
    if (result.data) {
      setCustomerId(result.data.id);
      toast({
        title: "Found!",
        description: `Welcome back, ${result.data.name}!`,
      });
    } else {
      toast({
        title: "Customer not found",
        description: "No account found with this email. Please book an appointment first.",
        variant: "destructive",
      });
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { customerId: number; message: string; isFromCustomer: boolean }) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
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
    if (!customerId || !newMessage.trim()) return;

    sendMessageMutation.mutate({
      customerId,
      message: newMessage.trim(),
      isFromCustomer: true,
    });
  };

  if (!customerId) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">My Messages</h1>
            <p className="text-xl text-muted-foreground">
              View and send messages to the salon
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-serif font-semibold">Find Your Account</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Enter the email address you used when booking your appointment to view your messages.
              </p>
              <div className="flex items-center space-x-4">
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleFindCustomer()}
                  className="flex-1"
                />
                <Button onClick={handleFindCustomer} className="btn-primary">
                  Find Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">My Messages</h1>
          <p className="text-xl text-muted-foreground">
            Chat with {customer?.name || "the salon"}
          </p>
        </div>

        <Card className="h-[600px] flex flex-col">
          {/* Message Header */}
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <MessageCircle className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Bella Beauty Salon</h3>
                  <p className="text-sm text-muted-foreground">{customer?.email}</p>
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
              {messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromCustomer ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`p-3 rounded-lg ${
                        message.isFromCustomer
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p
                      className={`text-xs text-muted-foreground mt-1 ${
                        message.isFromCustomer ? "text-right" : ""
                      }`}
                    >
                      {message.timestamp
                        ? new Date(message.timestamp).toLocaleTimeString()
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              {!messages?.length && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with the salon!
                  </p>
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
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
        </Card>
      </div>
    </div>
  );
}

