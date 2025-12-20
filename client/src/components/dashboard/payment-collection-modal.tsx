import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, DollarSign, Banknote } from "lucide-react";
import type { Appointment, Service, Customer } from "@shared/schema";

interface PaymentCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  service: Service | null;
  customer: Customer | null;
}

export function PaymentCollectionModal({
  isOpen,
  onClose,
  appointment,
  service,
  customer,
}: PaymentCollectionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Calculate remaining balance
  const remainingBalance = service
    ? (parseFloat(service.price) - parseFloat(service.downPayment)).toFixed(2)
    : "0.00";

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentComplete(false);
    }
  }, [isOpen]);

  const updatePaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/appointments/${appointment?.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ totalPaid: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update payment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setPaymentComplete(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCashPayment = async () => {
    setIsProcessing(true);
    try {
      await updatePaymentMutation.mutateAsync();
      toast({
        title: "Payment Recorded",
        description: `$${remainingBalance} cash payment recorded`,
      });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentComplete(false);
    onClose();
  };

  if (!appointment || !service || !customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Collect Payment
          </DialogTitle>
          <DialogDescription>
            Collect remaining balance for {customer.name}'s appointment
          </DialogDescription>
        </DialogHeader>

        {paymentComplete ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Payment Complete!</h3>
            <p className="text-muted-foreground mb-6">
              ${remainingBalance} has been collected for {service.name}
            </p>
            <Button onClick={handleClose} className="btn-primary">
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Payment Summary */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Total Price</span>
                <span>${service.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Down Payment (Paid)</span>
                <span className="text-green-600">-${service.downPayment}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Remaining Balance</span>
                  <span className="text-xl font-bold text-primary">${remainingBalance}</span>
                </div>
              </div>
            </div>

            {/* Cash Payment Confirmation */}
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <Banknote className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800">
                  Please collect <strong>${remainingBalance}</strong> in cash from the customer
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCashPayment}
                  disabled={isProcessing}
                  className="flex-1 btn-primary"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>Confirm Cash Received</>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
