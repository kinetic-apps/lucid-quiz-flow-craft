// Follow this setup guide to integrate the Deno runtime with Supabase
// https://deno.com/manual/runtime/supabase

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import Stripe from 'https://esm.sh/stripe@14.1.0'

console.log("Function script evaluating...");

// Simple environment variable retrieval
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const stripeTestSecretKey = Deno.env.get('STRIPE_TEST_SECRET_KEY') || stripeSecretKey;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Product configuration - using the new Lucid Web Access product
const LUCID_ACCESS_PRODUCT_ID = 'prod_SoEesIWpfzi1AQ';
const LUCID_ACCESS_TEST_PRODUCT_ID = 'prod_Sc48SvuQ7H71fb';

// Plan configurations with pricing
const PLAN_CONFIG = {
  '7day': {
    name: 'Lucid Access - 7 Day',
    totalPrice: 2.99,
    perDayPrice: 0.43
  },
  '1month': {
    name: 'Lucid Access - 1 Month', 
    totalPrice: 8.99,
    perDayPrice: 0.30
  },
  '3month': {
    name: 'Lucid Access - 3 Months',
    totalPrice: 19.99,
    perDayPrice: 0.22
  }
};

// Helper function to determine plan ID from amount
function getPlanIdFromAmount(amount: number): string {
  // Amount is in cents
  const dollarAmount = amount / 100;
  
  if (Math.abs(dollarAmount - 2.99) < 0.01) return '7day';
  if (Math.abs(dollarAmount - 8.99) < 0.01) return '1month';
  if (Math.abs(dollarAmount - 19.99) < 0.01) return '3month';
  
  // Default to 1month if amount doesn't match
  return '1month';
}

// Define CORS headers - include all possible origins that might call this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Be more specific in production! e.g., your Vercel URL
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, content-type, X-Mobile-Device, X-Supports-Apple-Pay, Cache-Control',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  // Get the origin from the request headers
  const origin = req.headers.get('Origin') || '*';
  
  // Create dynamic CORS headers with the requesting origin
  const dynamicCorsHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin, // Or dynamically set based on allowed origins
  };
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response('ok', {
      headers: dynamicCorsHeaders
    });
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    console.warn(`Method not allowed: ${req.method}`);
    return new Response('Method not allowed', { 
      status: 405,
      headers: dynamicCorsHeaders 
    });
  }

  try {
    console.log("Processing POST request...");
    const { amount, email, planId, testMode } = await req.json();
    
    console.log(`Request body: amount=${amount}, email=${email ? 'provided' : 'not provided'}, planId=${planId}, testMode=${testMode}`);
    
    // Validate required fields
    if (!amount) {
      console.warn("Missing required fields (amount)");
      return new Response(
        JSON.stringify({ error: 'Missing required fields (amount)' }), 
        { 
          status: 400,
          headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    if (typeof amount !== 'number' || amount <= 0) {
      console.warn(`Invalid amount: ${amount}`);
      return new Response(
        JSON.stringify({ error: 'Invalid amount. Must be a positive number.' }),
        {
          status: 400,
          headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine plan ID from amount or use provided planId
    const selectedPlanId = planId || getPlanIdFromAmount(amount);
    const planConfig = PLAN_CONFIG[selectedPlanId as keyof typeof PLAN_CONFIG];
    
    if (!planConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan configuration' }), 
        { 
          status: 400,
          headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // IMPORTANT: Use the STRIPE_SECRET_KEY environment variable directly
    // This should be configured to match your frontend's publishable key
    // In development: both should be test keys
    // In production: both should be live keys
    const activeStripeKey = stripeSecretKey;
    
    // Create Stripe instance with the active key
    const stripe = new Stripe(activeStripeKey, {
      apiVersion: '2023-10-16',
    });
    
    // Detect if we're in test mode based on the key prefix
    const isTestEnvironment = activeStripeKey.startsWith('sk_test_');
    
    console.log(`Stripe initialized with ${isTestEnvironment ? 'TEST' : 'LIVE'} key starting with: ${activeStripeKey.substring(0, 10)}`);
    
    // Use appropriate product ID based on the environment
    const productId = isTestEnvironment ? LUCID_ACCESS_TEST_PRODUCT_ID : LUCID_ACCESS_PRODUCT_ID;
    
    console.log(`Using ${isTestEnvironment ? 'TEST' : 'LIVE'} environment with product ID: ${productId} for plan: ${selectedPlanId}`);

    // Create or retrieve customer if email is provided
    let customer;
    if (email) {
      console.log(`Looking for customer with email: ${email}`);
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log(`Found existing customer: ${customer.id}`);
      } else {
        console.log(`Creating new customer for email: ${email}`);
        customer = await stripe.customers.create({
          email,
          metadata: {
            source: 'express_checkout'
          }
        });
        console.log(`Created new customer: ${customer.id}`);
      }
    } else {
      console.log("No email provided, creating anonymous customer");
      // Create anonymous customer for express checkout
      customer = await stripe.customers.create({
        metadata: {
          source: 'express_checkout',
          anonymous: 'true'
        }
      });
      console.log(`Created anonymous customer: ${customer.id}`);
    }

    console.log(`Creating subscription for customer: ${customer.id}, plan: ${selectedPlanId}, amount: ${amount}`);
    
    // Create a subscription instead of a one-time payment
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'usd',
          product: productId,
          recurring: {
            interval: selectedPlanId === '7day' ? 'week' : 'month',
            interval_count: selectedPlanId === '3month' ? 3 : 1,
          },
          unit_amount: amount, // amount is already in cents
        },
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'] // Only card for express checkout
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        planId: selectedPlanId,
        productName: planConfig.name,
        source: 'express_checkout'
      },
    });

    const paymentIntent = subscription.latest_invoice.payment_intent;

    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new Error('Failed to create payment intent for subscription');
    }

    console.log(`Subscription created successfully: ${subscription.id}, Payment Intent: ${paymentIntent.id}`);

    // Return the client secret to the client
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        subscriptionId: subscription.id,
        customerId: customer.id
      }), 
      { 
        status: 200,
        headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage,
        stack: errorStack // Be cautious about exposing stack traces in production
      }), 
      { 
        status: 500,
        headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});