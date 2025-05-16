import { useState, useEffect, useRef, memo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  ExpressCheckoutElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import type { ExpressCheckoutElementProps } from '@stripe/react-stripe-js'; // For onConfirm type, remove LayoutOption
import type { StripeError, PaymentIntent } from '@stripe/stripe-js'; // For error types and PaymentIntent

// Initialize Stripe with the environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentRequestButtonProps {
  amount: number;
  planName: string;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: Error) => void;
  email?: string | null;
}

// The inner component (ExpressEC) is where most of the Stripe logic happens
const ExpressEC = memo(function ExpressEC({ onSuccess, onError }: Omit<PaymentRequestButtonProps, 'amount' | 'planName' | 'email'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expressElementMounted, setExpressElementMounted] = useState(false);
  
  const stripeInstance = useStripe(); 
  const elementsInstance = useElements();

  // Safely check if the components are ready
  useEffect(() => {
    let mounted = true;
    
    const checkComponentsReady = () => {
      if (!mounted) return;
      
      if (stripeInstance && elementsInstance) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    };
    
    checkComponentsReady();
    
    // Clean up
    return () => {
      mounted = false;
    };
  }, [stripeInstance, elementsInstance]);

  const handleConfirm: ExpressCheckoutElementProps['onConfirm'] = async () => {
    if (!stripeInstance || !elementsInstance) {
      console.error('Stripe or Elements not available in ExpressEC for confirmation.');
      onError(new Error('Payment processing error. Please try again.'));
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const { error: submitError } = await elementsInstance.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        onError(new Error(submitError.message));
        setIsLoading(false);
        return;
      }
      
      // clientSecret for confirmPayment comes from the Elements provider context
      const { error, paymentIntent } = await stripeInstance.confirmPayment({
        elements: elementsInstance,
        redirect: 'if_required',
      });

      if (error) {
        const msg = error.message || 'Payment failed.';
        setErrorMessage(msg);
        onError(new Error(msg));
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent);
        } else {
          onError(new Error(`Payment status: ${paymentIntent.status}`));
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred during payment';
      console.error('Payment confirmation error:', err);
      setErrorMessage(errorMsg);
      onError(new Error(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle component loading state
  if (isLoading && !expressElementMounted) {
    return <div className="text-center py-4">Loading payment options...</div>;
  }
  
  if (errorMessage) {
    return <div className="text-red-500 text-sm font-medium text-center py-2">Error: {errorMessage}</div>;
  }
  
  if (!stripeInstance || !elementsInstance) {
    return <div className="text-center py-4">Initializing Stripe...</div>;
  }

  return (
    <div className="express-checkout-container">
      <ExpressCheckoutElement
        options={{
          paymentMethodOrder: ['apple_pay', 'google_pay', 'link', 'klarna'],
          layout: { maxColumns: 2, maxRows: 2 },
          wallets: {
            applePay: 'auto',
            googlePay: 'auto'
          },
          business: {
            name: 'Lucid'
          }
        }}
        onConfirm={handleConfirm}
        onReady={() => setExpressElementMounted(true)}
        onLoadError={(e) => {
          console.error("Express Checkout Element load error:", e);
          const msg = e.error?.message || "Failed to load Stripe Express Checkout.";
          setErrorMessage(msg);
          onError(new Error(msg));
          setIsLoading(false);
        }}
      />
      {isLoading && expressElementMounted && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="text-center py-2">Processing...</div>
        </div>
      )}
    </div>
  );
});

// This form assumes it is rendered *inside* an <Elements> provider
const PaymentRequestForm = memo(function PaymentRequestForm({ onSuccess, onError }: PaymentRequestButtonProps) {
  return (
    <div className="w-full mb-4 relative">
      <ExpressEC onSuccess={onSuccess} onError={onError} />
    </div>
  );
});

// Primary exported component, will be used in CheckoutPage.tsx
const PaymentRequestButton = memo(function PaymentRequestButton(props: PaymentRequestButtonProps) {
  return <PaymentRequestForm {...props} />;
});

export default PaymentRequestButton; 