import { useState, useEffect } from 'react';
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
  onSuccess: (paymentIntent: PaymentIntent) => void; // Use PaymentIntent type
  onError: (error: Error) => void;
  email?: string | null; 
}

const PaymentRequestForm = ({ amount, planName, onSuccess, onError, email }: PaymentRequestButtonProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // No Stripe hooks here; they'll be used inside the inner component once <Elements> exists.

  useEffect(() => {
    // Fetch client secret once Stripe.js is ready
    if (!window || !amount) return;

    const fetchClientSecret = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch('https://bsqmlzocdhummisrouzs.supabase.co/functions/v1/create-payment-intent-express', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            email: email,
          }),
        });

        if (!response.ok) {
          let errorDetail = 'Failed to create Payment Intent. The server returned an error.';
          try {
            const errorData = await response.json();
            // Try to get a more specific message from server's response
            errorDetail = errorData.details || errorData.message || errorData.error || errorDetail;
          } catch (parseError) {
            console.error("Failed to parse error JSON from server:", parseError);
            // Fallback to response status text if JSON parsing fails
            errorDetail = response.statusText || errorDetail;
          }
          throw new Error(errorDetail);
        }

        const { clientSecret: newClientSecret, id: paymentIntentId } = await response.json(); // Assuming server might also return PI id
        if (!newClientSecret) {
          throw new Error('Client secret was not returned from the server.');
        }
        setClientSecret(newClientSecret);
      } catch (error: unknown) {
        console.error("Failed to create PaymentIntent for Express Checkout:", error);
        const message = error instanceof Error ? error.message : 'Failed to initialize payment.';
        setErrorMessage(message);
        onError(error instanceof Error ? error : new Error(message));
      } finally {
        setIsLoading(false);
      }
    };

    if (amount > 0) {
        fetchClientSecret();
    } else {
        setIsLoading(false);
        setClientSecret(null);
    }
  }, [amount, email, onError]);

  // Inner component rendered only after clientSecret is ready and inside <Elements>
  const ExpressEC = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleConfirm: ExpressCheckoutElementProps['onConfirm'] = async () => {
      if (!stripe || !elements) return;
      setIsLoading(true);
      setErrorMessage(null);

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        onError(new Error(submitError.message));
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: clientSecret!,
        redirect: 'if_required',
      });

      if (error) {
        const msg = error.message || 'Payment failed.';
        setErrorMessage(msg);
        onError(new Error(msg));
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') onSuccess(paymentIntent); else onError(new Error(paymentIntent.status));
      }
      setIsLoading(false);
    };

    return (
      <ExpressCheckoutElement
        options={{
          paymentMethodOrder: ['apple_pay', 'google_pay', 'paypal', 'link'],
          layout: { maxColumns: 2, maxRows: 2 }
        }}
        onConfirm={handleConfirm}
        onReady={() => setIsLoading(false)}
      />
    );
  };

  const handleClick = () => {
    if (!clientSecret) {
      setErrorMessage("Payment details are not yet available. Please wait or try refreshing.");
    }
  };

  const handleLoadError = (event: { error: StripeError | null }) => {
    console.error("ExpressCheckoutElement load error:", event.error);
    const message = event.error?.message || "Failed to load payment options.";
    setErrorMessage(message);
    if (event.error) {
      onError(new Error(message)); // Convert StripeError to Error
    } else {
      onError(new Error("Failed to load payment options."));
    }
    setIsLoading(false);
  };

  if (!clientSecret) {
    return isLoading ? <div className="text-center py-4">Loading payment options...</div> : null;
  }

  // Mount a dedicated Elements with the clientSecret
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="w-full mb-4">
        <ExpressEC />
        {isLoading && <div className="text-center py-2">Processing...</div>}
      </div>
    </Elements>
  );
};

export default function PaymentRequestButtonWrapper(props: PaymentRequestButtonProps) {
  // We fetch clientSecret inside the form, so just render the form directly.
  return <PaymentRequestForm {...props} />;
} 