// Follow this setup guide to integrate the Deno runtime with Supabase
// https://deno.com/manual/runtime/supabase

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import Stripe from 'https://esm.sh/stripe@14.1.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Support both test and live Stripe keys
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripeTestSecretKey = Deno.env.get('STRIPE_TEST_SECRET_KEY') || stripeSecretKey

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Product configuration - using the Lucid Access product from mobile app
// Support different product IDs for test/live modes
const LUCID_ACCESS_PRODUCT_ID = 'prod_SefSK4P6W4Wzvn';
const LUCID_ACCESS_TEST_PRODUCT_ID = Deno.env.get('STRIPE_TEST_PRODUCT_ID') || 'prod_test_lucid_access';

// Plan configurations with dynamic pricing
const PLAN_CONFIG = {
  '7day': {
    name: 'Lucid Access - 7 Day',
    price: 299, // $2.99 in cents
    interval: 'week',
    intervalCount: 1,
    trialDays: 0
  },
  '1month': {
    name: 'Lucid Access - 1 Month', 
    price: 899, // $8.99 in cents
    interval: 'month',
    intervalCount: 1,
    trialDays: 0
  },
  '3month': {
    name: 'Lucid Access - 3 Months',
    price: 1999, // $19.99 in cents
    interval: 'month',
    intervalCount: 3,
    trialDays: 0
  }
};

// Define CORS headers - include your Vercel domain explicitly
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    })
  }

  // Only handle POST requests for checkout session creation
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    // Parse the request body - now accepting planId instead of priceId
    const { priceId, userId, email, planId, successUrl, cancelUrl, testMode } = await req.json()
    
    // Determine if we're in test mode
    const isTestMode = testMode || (stripeTestSecretKey && stripeTestSecretKey.startsWith('sk_test_'))
    
    // Create appropriate Stripe instance
    const stripe = new Stripe(isTestMode ? stripeTestSecretKey : stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
    
    // Use appropriate product ID
    const productId = isTestMode ? LUCID_ACCESS_TEST_PRODUCT_ID : LUCID_ACCESS_PRODUCT_ID
    
    console.log(`Using ${isTestMode ? 'TEST' : 'LIVE'} mode with product ID: ${productId}`)

    // Use planId if provided, otherwise fall back to extracting from priceId
    const selectedPlanId = planId || (priceId && Object.entries(PLAN_CONFIG).find(([_, config]) => 
      priceId.includes(config.name.toLowerCase().replace(/\s+/g, '_'))
    )?.[0]) || '1month';

    // Validate required fields
    if (!successUrl || !cancelUrl || !selectedPlanId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First check if a customer with this email already exists
    let customer;
    if (email) {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        // Use existing customer
        customer = customers.data[0]
      } else {
        // Create a new customer
        customer = await stripe.customers.create({
          email,
          metadata: {
            userId,
          },
        })
      }
    } else {
      // Create an anonymous customer if email is not provided
      customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      })
    }

    // Get the plan configuration
    const planConfig = PLAN_CONFIG[selectedPlanId as keyof typeof PLAN_CONFIG]
    
    if (!planConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create price data for the checkout session
    const priceData = {
      currency: 'usd',
      product: productId, // Use the appropriate product ID based on mode
      recurring: {
        interval: planConfig.interval as 'day' | 'week' | 'month' | 'year',
        interval_count: planConfig.intervalCount,
      },
      unit_amount: planConfig.price,
    }

    // Create the checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_configuration: 'pmc_1RQVeTLFUMi6CEqxYxhABwOs',
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}`,
      metadata: {
        userId,
        planId: selectedPlanId,
        productName: planConfig.name,
      },
    })

    // Return the session ID to the client
    return new Response(
      JSON.stringify({ sessionId: session.id }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 