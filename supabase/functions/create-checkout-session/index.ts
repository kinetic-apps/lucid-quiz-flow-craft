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
    id: 'prod_SLBc1BqDeFcEHa',
    priceId: 'price_1RQVEuLFUMi6CEqxBMskP9TG',
    name: 'LUCID-7-Day-Plan',
    totalPrice: 2.99,
    perDayPrice: 0.43
  },
  '1month': {
    id: 'prod_SLBZdyOg3nqT7A',
    priceId: 'price_1RQVCkLFUMi6CEqx1EYMZu0I',
    name: 'LUCID-1-Month-Plan',
    totalPrice: 8.99,
    perDayPrice: 0.30
  },
  '3month': {
    id: 'prod_SLBbecdAtmmydE',
    priceId: 'price_1RQVEPLFUMi6CEqxdE5xNYtT',
    name: 'LUCID-3-Month-Plan',
    totalPrice: 19.99,
    perDayPrice: 0.22
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
    // Parse the request body
    const { priceId, userId, email, planId, successUrl, cancelUrl } = await req.json()

    // Validate required fields
    if (!priceId || !successUrl || !cancelUrl) {
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

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_configuration: 'pmc_1RQVeTLFUMi6CEqxYxhABwOs',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}`,
      metadata: {
        userId,
        planId,
        productName: productDetails.name,
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