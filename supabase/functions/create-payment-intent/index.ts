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

// Product configuration - using the Lucid Access product from mobile app
const LUCID_ACCESS_PRODUCT_ID = 'prod_SefSK4P6W4Wzvn';

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

// Define CORS headers
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

  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    // Parse the request body
    const { priceId, userId, email, planId, customerName } = await req.json()

    // Use planId if provided, otherwise try to extract from priceId
    const selectedPlanId = planId || (priceId && Object.keys(PLAN_CONFIG).find(key => 
      priceId.includes(key)
    )) || '1month';

    // Validate required fields
    if (!selectedPlanId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle customer creation with or without email
    let customer;
    if (email) {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        // Use existing customer
        customer = customers.data[0]
        // Optionally update name if a more specific one is provided now and it's not a generic fallback
        if (customerName && customer.name !== customerName && !customerName.startsWith('User ')) {
          await stripe.customers.update(customer.id, { name: customerName });
        }
        // Ensure supabase_user_id is in metadata if missing
        if (userId && (!customer.metadata || customer.metadata.supabase_user_id !== userId)) {
          await stripe.customers.update(customer.id, {
            metadata: { ...customer.metadata, supabase_user_id: userId },
          });
        }
      } else {
        // Create a new customer with email and name
        customer = await stripe.customers.create({
          email,
          name: customerName, // Use the provided customerName
          metadata: {
            supabase_user_id: userId, // Store supabaseUserId
          },
        })
      }
    } else {
      // Create an anonymous customer if email is not provided (should be placeholder email now)
      customer = await stripe.customers.create({
        name: customerName, // Use the provided customerName (likely a fallback like 'User ...')
        email: email, // This will be the placeholder email
        metadata: {
          supabase_user_id: userId, // Store supabaseUserId
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

    // Create a subscription instead of a one-time payment
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'usd',
          product: LUCID_ACCESS_PRODUCT_ID,
          recurring: {
            interval: selectedPlanId === '7day' ? 'week' : 'month',
            interval_count: selectedPlanId === '3month' ? 3 : 1,
          },
          unit_amount: Math.round(planConfig.totalPrice * 100), // convert to cents
        },
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        planId: selectedPlanId,
        productName: planConfig.name,
        supabase_user_id: userId,
      },
    });

    const paymentIntent = subscription.latest_invoice.payment_intent;

    // Return the client secret to the client
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
        subscriptionId: subscription.id
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 