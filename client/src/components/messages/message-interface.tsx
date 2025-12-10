import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User } from "lucide-react";
import type { Message, Customer } from "@shared/schema";

interface MessageInterfaceProps {
  customer: Customer;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function MessageInterface({ customer, messages, onSendMessage, isLoading }: MessageInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  return (
    <Card className="h-[600px] flex flex-col overflow-hidden">
      {/* Message Header */}
      <CardHeader className="border-b border-border bg-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
              <User className="text-primary w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
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
          {messages.map((message) => (
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
          {!messages.length && (
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
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            className="btn-primary"
            disabled={!newMessage.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
