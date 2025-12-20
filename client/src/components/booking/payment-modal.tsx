import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Square Web Payments SDK types
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<Payments>;
    };
  }
}

interface Payments {
  card: () => Promise<Card>;
  applePay: (paymentRequest: PaymentRequest) => Promise<ApplePay | null>;
  googlePay: (paymentRequest: PaymentRequest) => Promise<GooglePay | null>;
}

interface Card {
  attach: (elementId: string) => Promise<void>;
  tokenize: () => Promise<TokenResult>;
  destroy: () => Promise<void>;
}

interface ApplePay {
  tokenize: () => Promise<TokenResult>;
}

interface GooglePay {
  tokenize: () => Promise<TokenResult>;
}

interface TokenResult {
  status: "OK" | "ERROR";
  token?: string;
  errors?: Array<{ message: string }>;
}

interface PaymentRequest {
  countryCode: string;
  currencyCode: string;
  total: {
    amount: string;
    label: string;
  };
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  onPaymentSuccess: (paymentId: string) => void;
}

interface SquareConfig {
  applicationId: string;
  locationId: string;
  environment: string;
}

export function PaymentModal({
  open,
  onOpenChange,
  amount,
  serviceName,
  customerName,
  customerEmail,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { toast } = useToast();
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<Card | null>(null);
  const [isCardReady, setIsCardReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch Square configuration
  const { data: squareConfig } = useQuery<SquareConfig>({
    queryKey: ["/api/square/config"],
    enabled: open,
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      const response = await apiRequest("POST", "/api/square/payment", {
        sourceId,
        amount,
        customerEmail,
        customerName,
        serviceName,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setPaymentSuccess(true);
        toast({
          title: "Payment Successful!",
          description: `Your down payment of $${amount} has been processed.`,
        });
        setTimeout(() => {
          onPaymentSuccess(data.payment.id);
          onOpenChange(false);
          setPaymentSuccess(false);
        }, 2000);
      } else {
        toast({
          title: "Payment Failed",
          description: data.message || "Unable to process payment.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment.",
        variant: "destructive",
      });
    },
  });

  // Initialize Square Card
  useEffect(() => {
    if (!open || !squareConfig?.applicationId || !window.Square) {
      return;
    }

    let isMounted = true;

    const initializeCard = async () => {
      if (isInitializing || cardRef.current) return;
      
      setIsInitializing(true);
      
      try {
        const payments = await window.Square!.payments(
          squareConfig.applicationId,
          squareConfig.locationId
        );

        const card = await payments.card();
        
        if (!isMounted) {
          await card.destroy();
          return;
        }

        await card.attach("#card-container");
        cardRef.current = card;
        setIsCardReady(true);
      } catch (error) {
        console.error("Failed to initialize Square card:", error);
        if (isMounted) {
          toast({
            title: "Payment Setup Error",
            description: "Unable to initialize payment form. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeCard, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (cardRef.current) {
        cardRef.current.destroy().catch(console.error);
        cardRef.current = null;
        setIsCardReady(false);
      }
    };
  }, [open, squareConfig, toast]);

  // Cleanup on modal close
  useEffect(() => {
    if (!open && cardRef.current) {
      cardRef.current.destroy().catch(console.error);
      cardRef.current = null;
      setIsCardReady(false);
      setPaymentSuccess(false);
    }
  }, [open]);

  const handlePayment = async () => {
    if (!cardRef.current) {
      toast({
        title: "Error",
        description: "Payment form not ready. Please wait.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await cardRef.current.tokenize();

      if (result.status === "OK" && result.token) {
        paymentMutation.mutate(result.token);
      } else {
        const errorMessage = result.errors?.[0]?.message || "Card verification failed";
        toast({
          title: "Card Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Tokenization error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to process card. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">
            {paymentSuccess ? "Payment Complete!" : "Complete Your Down Payment"}
          </DialogTitle>
          <DialogDescription>
            {paymentSuccess 
              ? "Your booking is being confirmed..."
              : `Secure payment of $${amount} for ${serviceName}`
            }
          </DialogDescription>
        </DialogHeader>

        {paymentSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-foreground">Thank you!</p>
            <p className="text-sm text-muted-foreground">Finalizing your appointment...</p>
          </div>
        ) : (
          <>
            {/* Payment Summary */}
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="font-medium">{serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Down Payment</span>
                <span className="text-lg font-bold text-primary">${amount}</span>
              </div>
            </div>

            {/* Square Card Container */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CreditCard className="w-4 h-4" />
                <span>Enter your card details</span>
              </div>
              
              <div 
                id="card-container" 
                ref={cardContainerRef}
                className="min-h-[100px] border border-border rounded-lg p-3 bg-background"
              >
                {(isInitializing || !isCardReady) && (
                  <div className="flex items-center justify-center h-full py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading payment form...
                    </span>
                  </div>
                )}
              </div>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your payment is secured by Square</span>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={!isCardReady || paymentMutation.isPending}
              className="w-full mt-4 py-6 text-lg font-semibold"
            >
              {paymentMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ${amount}
                </>
              )}
            </Button>

            {/* Cancel link */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              Cancel and go back
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

