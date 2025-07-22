import { useState, useEffect } from 'react';
import { getStripe } from '@/lib/stripe';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe with error handling
const stripePromise = getStripe();

interface PaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  customer?: string;
}

interface CheckoutFormProps {
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onCancel: () => void;
}

const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not initialized yet. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Get user ID from localStorage for the return URL
      const userId = localStorage.getItem('user_id');
      const returnUrl = userId 
        ? `${window.location.origin}/checkout/verify-phone?userId=${userId}`
        : `${window.location.origin}/checkout/verify-phone`;
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        setErrorMessage(error.message || 'An unexpected error occurred');
        setIsLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsLoading(false);
        console.log('Full paymentIntent object:', paymentIntent);
        onSuccess(paymentIntent as PaymentIntent);
      } else {
        setIsLoading(false);
        setErrorMessage('Payment status is pending or requires additional steps.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('An unexpected error occurred during payment processing.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-red-500 text-sm font-medium">{errorMessage}</div>
      )}
      
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full bg-[#8A2BE2] text-white py-4 rounded-lg font-bold text-lg disabled:opacity-70"
        >
          {isLoading ? 'Processing...' : 'PAY NOW'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 text-sm"
        >
          Cancel and go back
        </button>
      </div>
    </form>
  );
};

interface EmbeddedCheckoutProps {
  clientSecret: string;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onCancel: () => void;
}

export default function EmbeddedCheckout({ clientSecret, onSuccess, onCancel }: EmbeddedCheckoutProps) {
  const [ready, setReady] = useState(false);
  
  // Only render Elements when client secret is available
  useEffect(() => {
    if (clientSecret) {
      setReady(true);
    }
  }, [clientSecret]);
  
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#8A2BE2',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#ef4444',
        borderRadius: '8px',
      },
    },
  };

  if (!ready) {
    return <div className="py-4 text-center">Loading payment form...</div>;
  }

  return (
    <div className="w-full">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
} 