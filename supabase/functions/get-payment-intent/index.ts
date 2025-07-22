import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const { paymentIntentId, testMode } = await req.json()
    
    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: 'Missing payment intent ID' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
    const stripeTestSecretKey = Deno.env.get('STRIPE_TEST_SECRET_KEY') || stripeSecretKey
    
    // Determine if we're in test mode
    const isTestMode = testMode || (stripeTestSecretKey && stripeTestSecretKey.startsWith('sk_test_'))
    
    // Create appropriate Stripe instance
    const stripe = new Stripe(isTestMode ? stripeTestSecretKey : stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
    
    console.log(`Fetching payment intent ${paymentIntentId} in ${isTestMode ? 'TEST' : 'LIVE'} mode`)
    
    // Fetch the payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      console.log(`Payment intent retrieved. Customer: ${paymentIntent.customer}`)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          customerId: paymentIntent.customer,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: stripeError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in get-payment-intent:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})