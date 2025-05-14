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

// Product IDs from our Stripe account - same as in create-checkout-session
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
    const { priceId, userId, email, planId } = await req.json()

    // Validate required fields - only check for priceId
    if (!priceId) {
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
      } else {
        // Create a new customer with email
        customer = await stripe.customers.create({
          email,
          metadata: {
            userId: userId || '',
          },
        })
      }
    } else {
      // Create an anonymous customer if email is not provided
      customer = await stripe.customers.create({
        metadata: {
          userId: userId || '',
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create a payment intent for one-time payment
    // Or use subscriptions.create for recurring payments
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(productDetails.totalPrice * 100), // convert to cents
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        planId,
        productName: productDetails.name,
      },
    });

    // Return the client secret to the client
    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id
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