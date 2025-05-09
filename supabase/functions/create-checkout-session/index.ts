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

// Product IDs from our Stripe account
const STRIPE_PRODUCTS = {
  '7day': {
    id: 'prod_SHPfu4RexpUljs',
    priceId: 'price_1RMqpsQKcWZpjipTe90RBITg',
    name: '7-DAY PLAN',
    totalPrice: 43.50,
    perDayPrice: 6.21
  },
  '1month': {
    id: 'prod_SHPh2iwxiuTkPk',
    priceId: 'price_1RMqrjQKcWZpjipTxRHY8jHS',
    name: '1-MONTH PLAN',
    totalPrice: 43.50,
    perDayPrice: 1.45
  },
  '3month': {
    id: 'prod_SHPh3bBU9qM6Nf',
    priceId: 'price_1RMqsDQKcWZpjipTmyHqjt3f',
    name: '3-MONTH PLAN',
    totalPrice: 79.99,
    perDayPrice: 0.88
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    })
  }

  // Only handle POST requests for checkout session creation
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Parse the request body
    const { priceId, userId, email, planId, successUrl, cancelUrl } = await req.json()

    // Validate required fields
    if (!priceId || !email || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // First check if a customer with this email already exists
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    let customer
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

    // Get the product details
    const productDetails = Object.values(STRIPE_PRODUCTS).find(
      (product) => product.priceId === priceId
    )

    if (!productDetails) {
      return new Response(
        JSON.stringify({ error: 'Invalid price ID' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
        productName: productDetails.name,
      },
      automatic_tax: { enabled: true },
      client_reference_id: userId || undefined,
    })

    // Set CORS headers for the main response
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      'Content-Type': 'application/json'
    }

    // Return the session ID to the client
    return new Response(
      JSON.stringify({ sessionId: session.id }), 
      { 
        status: 200,
        headers: corsHeaders
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    // Set CORS headers for the main response
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      'Content-Type': 'application/json'
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
}) 