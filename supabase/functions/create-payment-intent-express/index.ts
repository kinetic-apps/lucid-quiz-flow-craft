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
    const { amount, email, testMode } = await req.json();
    
    console.log(`Request body: amount=${amount}, email=${email ? 'provided' : 'not provided'}, testMode=${testMode}`);
    
    // Debug: Log the keys being used (first few chars only for security)
    console.log('STRIPE_SECRET_KEY starts with:', stripeSecretKey.substring(0, 10));
    console.log('STRIPE_TEST_SECRET_KEY starts with:', stripeTestSecretKey.substring(0, 10));
    
    // Determine if we're in test mode - ONLY if explicitly requested
    const isTestMode = testMode === true;
    
    // Create appropriate Stripe instance
    const stripe = new Stripe(isTestMode ? stripeTestSecretKey : stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    console.log(`Stripe client initialized in ${isTestMode ? 'TEST' : 'LIVE'} mode with key starting: ${(isTestMode ? stripeTestSecretKey : stripeSecretKey).substring(0, 10)}`);

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


    // Create or retrieve customer if email is provided
    let customerId = '';
    if (email) {
      console.log(`Looking for customer with email: ${email}`);
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log(`Found existing customer: ${customerId}`);
      } else {
        console.log(`Creating new customer for email: ${email}`);
        const customer = await stripe.customers.create({
          email,
        });
        customerId = customer.id;
        console.log(`Created new customer: ${customerId}`);
      }
    } else {
      console.log("No email provided, proceeding without customer or creating anonymous if necessary.");
      // Stripe will create a guest customer if `customer` is not provided in paymentIntent
    }

    console.log(`Attempting to create payment intent with amount: ${amount}, customer: ${customerId || 'guest'}`);
    
    // Create a PaymentIntent with explicit payment method types including Apple Pay
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'never' 
      },
      metadata: {
        integration_check: 'express_checkout_element_v2'
      }
    };
    if (customerId) {
      paymentIntentParams.customer = customerId;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    console.log(`Payment intent created successfully: ${paymentIntent.id}, Client Secret: ${paymentIntent.client_secret ? 'OK' : 'MISSING'}`);

    // Return the client secret to the client
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      }), 
      { 
        status: 200,
        headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
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