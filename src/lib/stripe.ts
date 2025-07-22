import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!key) {
      console.error('Stripe publishable key is not defined');
      return null;
    }

    try {
      // First try with advanced fraud signals disabled
      stripePromise = loadStripe(key, {
        advancedFraudSignals: false
      });
    } catch (error) {
      console.warn('Stripe blocked by client, likely due to ad blocker. Stripe will still work but without fraud detection.');
      // Fallback - this should still work even with blockers
      stripePromise = Promise.resolve(null).then(() => 
        loadStripe(key, {
          advancedFraudSignals: false
        })
      );
    }
  }

  return stripePromise;
};

// Helper to check if Stripe is available
export const isStripeAvailable = async (): Promise<boolean> => {
  try {
    const stripe = await getStripe();
    return stripe !== null;
  } catch {
    return false;
  }
};