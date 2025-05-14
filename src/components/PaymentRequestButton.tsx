import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentRequestButtonElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with the environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentRequestButtonProps {
  amount: number;
  planName: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
}

const PaymentRequestForm = ({ amount, planName, onSuccess, onError }: PaymentRequestButtonProps) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: `Lucid - ${planName}`,
        amount: Math.round(amount * 100), // amount in cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if the Payment Request is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    pr.on('paymentmethod', async (e) => {
      try {
        // Create a PaymentIntent on the server
        const response = await fetch('https://bsqmlzocdhummisrouzs.supabase.co/functions/v1/create-payment-intent-express', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            email: e.payerEmail,
            payment_method_id: e.paymentMethod.id,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const { clientSecret, id } = await response.json();

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: e.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (error) {
          e.complete('fail');
          onError(error);
        } else {
          e.complete('success');
          if (paymentIntent.status === 'requires_action') {
            // Let Stripe.js handle the rest of the payment flow
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
            if (error) {
              onError(error);
            } else {
              onSuccess(paymentIntent);
            }
          } else {
            onSuccess(paymentIntent);
          }
        }
      } catch (err) {
        e.complete('fail');
        onError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    });

    return () => {
      pr.off('paymentmethod');
    };
  }, [stripe, amount, planName, onSuccess, onError]);

  if (!canMakePayment) {
    return null;
  }

  return (
    <div className="w-full mb-4">
      <PaymentRequestButtonElement 
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'buy',
              theme: 'dark',
              height: '48px',
            },
          },
        }}
      />
    </div>
  );
};

export default function PaymentRequestButton({ amount, planName, onSuccess, onError }: PaymentRequestButtonProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentRequestForm 
        amount={amount} 
        planName={planName} 
        onSuccess={onSuccess} 
        onError={onError} 
      />
    </Elements>
  );
} 