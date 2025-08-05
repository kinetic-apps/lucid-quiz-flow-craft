// Stripe client integration
import { supabase } from '@/lib/supabase';
import { getTestModeFlag } from '@/lib/stripe-utils';

// Product IDs from our Stripe account
// Using the Lucid Access product ID from mobile app
const LUCID_ACCESS_PRODUCT_ID = 'prod_SoEesIWpfzi1AQ';

export const STRIPE_PRODUCTS = {
  '7day': {
    id: LUCID_ACCESS_PRODUCT_ID,
    priceId: 'price_7day', // These will need to be created in Stripe
    name: 'Lucid Access - 7 Day',
    totalPrice: 2.99,
    perDayPrice: 0.43
  },
  '1month': {
    id: LUCID_ACCESS_PRODUCT_ID,
    priceId: 'price_1month', // These will need to be created in Stripe
    name: 'Lucid Access - 1 Month',
    totalPrice: 8.99,
    perDayPrice: 0.30
  },
  '3month': {
    id: LUCID_ACCESS_PRODUCT_ID,
    priceId: 'price_3month', // These will need to be created in Stripe
    name: 'Lucid Access - 3 Months',
    totalPrice: 19.99,
    perDayPrice: 0.22
  }
};

// Create a Stripe checkout session
export async function createStripeCheckoutSession(
  priceId: string,
  userId: string,
  email: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    // Call our Supabase Edge Function to create a checkout session
    const response = await fetch('https://tcmwpmjjutlziudlwiau.supabase.co/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        email,
        planId,
        successUrl,
        cancelUrl,
        ...getTestModeFlag(), // Include testMode flag if in test mode
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch user by email:', error);
    return null;
  }
}

// Update user with Stripe customer ID
export async function updateUserWithStripeCustomerId(
  userId: string,
  stripeCustomerId: string
) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user with Stripe customer ID:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update user with Stripe customer ID:', error);
    return false;
  }
}

// Update user with subscription details
export async function updateUserWithSubscription(
  userId: string,
  subscriptionId: string,
  customerId: string,
  plan: string,
  startDate: string,
  endDate: string
) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        subscription_plan: plan,
        subscription_start_date: startDate,
        subscription_end_date: endDate,
        is_premium: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    return false;
  }
}

export async function createStripePaymentIntent(
  priceId: string,
  userId: string | null,
  email: string | null,
  planId: string,
  customerName?: string | null
) {
  try {
    const response = await fetch('https://tcmwpmjjutlziudlwiau.supabase.co/functions/v1/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: userId || undefined,
        email: email || undefined,
        planId,
        customerName: customerName || undefined,
        ...getTestModeFlag(), // Include testMode flag if in test mode
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const { clientSecret, customerId } = await response.json();
    return { clientSecret, customerId };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
} 