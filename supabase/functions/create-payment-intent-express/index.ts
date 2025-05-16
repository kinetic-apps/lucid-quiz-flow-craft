// Follow this setup guide to integrate the Deno runtime with Supabase
// https://deno.com/manual/runtime/supabase

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import Stripe from 'https://esm.sh/stripe@14.1.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

// Define CORS headers - include all possible origins that might call this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, content-type, X-Mobile-Device, X-Supports-Apple-Pay, Cache-Control',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Get the origin from the request headers
  const origin = req.headers.get('Origin') || '*';
  
  // Create dynamic CORS headers with the requesting origin
  const dynamicCorsHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin
  };
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: dynamicCorsHeaders
    });
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: dynamicCorsHeaders 
    });
  }

  try {
    // Parse the request body
    const { amount, email } = await req.json();
    
    console.log(`Processing payment intent request: amount=${amount}, email=${email ? 'provided' : 'not provided'}`);

    // Validate required fields
    if (!amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (amount)' }), 
        { 
          status: 400,
          headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create or retrieve customer if email is provided
    let customerId = '';
    if (email) {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log(`Found existing customer: ${customerId}`);
      } else {
        const customer = await stripe.customers.create({
          email,
        });
        customerId = customer.id;
        console.log(`Created new customer: ${customerId}`);
      }
    }

    // Create payment methods object with explicit types for Apple Pay support
    const paymentMethodTypes = ['card', 'apple_pay', 'google_pay'];
    console.log(`Creating payment intent with methods: ${paymentMethodTypes.join(', ')}`);
    
    // Create a PaymentIntent with explicit payment method types including Apple Pay
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customerId || undefined,
      payment_method_types: paymentMethodTypes,
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'always' 
      },
      metadata: {
        integration_check: 'express_checkout_element'
      }
    });

    console.log(`Payment intent created: ${paymentIntent.id}`);

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
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500,
        headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 