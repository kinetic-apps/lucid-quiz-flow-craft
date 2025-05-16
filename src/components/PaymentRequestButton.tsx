import { useState, useEffect, useRef } from 'react';
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

// This form assumes it is rendered *inside* an <Elements> provider
// that has been initialized with a clientSecret.
const PaymentRequestForm = ({ amount, planName, onSuccess, onError, email }: PaymentRequestButtonProps) => {
  // const [clientSecret, setClientSecret] = useState<string | null>(null); // No longer managed here
  const clientSecretRef = useRef<string | null>(null); // To track if we attempted fetch for current amount

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Initial loading handled by parent now for clientSecret

  const stripe = useStripe();
  const elements = useElements();

  // Client secret is now expected to be in the Elements context from the parent.
  // This useEffect is now just for safety or if we decided to update the element itself, which is not typical for clientSecret.
  // The main clientSecret fetching logic will be moved to CheckoutPage.tsx.
  // For now, let's simplify this component assuming clientSecret is handled by the parent <Elements>.

  // Inner component rendered only after clientSecret is ready and inside <Elements>
  const ExpressEC = () => {
    // These hooks are safe now because ExpressEC is rendered by PaymentRequestForm,
    // which itself should be under an <Elements> provider managed by CheckoutPage.
    const stripeInstance = useStripe(); 
    const elementsInstance = useElements();

    useEffect(() => {
        // Check if Elements is ready and stripe is available
        if (stripeInstance && elementsInstance) {
            setIsLoading(false); // Ready to show buttons
        } else {
            setIsLoading(true); // Not ready, show loading
        }
    }, [stripeInstance, elementsInstance]);

    const handleConfirm: ExpressCheckoutElementProps['onConfirm'] = async () => {
      if (!stripeInstance || !elementsInstance) {
        console.error('Stripe or Elements not available in ExpressEC for confirmation.');
        onError(new Error('Payment processing error. Please try again.'));
        return;
      }
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
        // clientSecret is not explicitly passed here; it's taken from Elements options
      });

      if (error) {
        const msg = error.message || 'Payment failed.';
        setErrorMessage(msg);
        onError(new Error(msg));
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') onSuccess(paymentIntent); else onError(new Error(`Payment status: ${paymentIntent.status}`));
      }
      setIsLoading(false);
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading payment options...</div>;
    }
    if (errorMessage) {
        return <div className="text-red-500 text-sm font-medium text-center py-2">Error: {errorMessage}</div>;
    }
    if (!stripeInstance || !elementsInstance) { // Should not happen if isLoading is false
        return <div className="text-center py-4">Initializing Stripe...</div>;
    }

    return (
      <ExpressCheckoutElement
        options={{
          paymentMethodOrder: ['apple_pay', 'google_pay', 'paypal', 'link'],
          layout: { maxColumns: 2, maxRows: 2 },
        }}
        onConfirm={handleConfirm}
        // onClick can be added if needed
        // onReady is handled by isLoading state based on stripe/elements instances
        onLoadError={(e) => {
            const msg = e.error?.message || "Failed to load Stripe Express Checkout.";
            setErrorMessage(msg);
            onError(new Error(msg));
            setIsLoading(false);
        }}
      />
    );
  };

  // PaymentRequestForm now just returns ExpressEC, assuming it's under a parent <Elements>
  // The parent <Elements> (in CheckoutPage.tsx) will be responsible for providing the clientSecret.
  return (
    <div className="w-full mb-4">
      <ExpressEC />
      {/* General loading state for operations like confirmPayment, not initial load of buttons */}
      {isLoading && !errorMessage && <div className="text-center py-2">Processing...</div>}
    </div>
  );
};

export default function PaymentRequestButtonWrapper(props: PaymentRequestButtonProps) {
  // This wrapper no longer creates an <Elements> provider itself.
  // It expects to be rendered within an <Elements> provider higher up in the tree (e.g., in CheckoutPage).
  // The clientSecret will be fetched in CheckoutPage and passed to that <Elements> provider.
  return <PaymentRequestForm {...props} />;
} 