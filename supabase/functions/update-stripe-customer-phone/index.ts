import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
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
    const { userId, phoneNumber, testMode, email, visitorId } = await req.json()
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing phone number' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
    const stripeTestSecretKey = Deno.env.get('STRIPE_TEST_SECRET_KEY') || stripeSecretKey
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Determine if we're in test mode
    const isTestMode = testMode || (stripeTestSecretKey && stripeTestSecretKey.startsWith('sk_test_'))
    
    // Create appropriate Stripe instance
    const stripe = new Stripe(isTestMode ? stripeTestSecretKey : stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
    
    // Use appropriate product ID
    const productId = isTestMode ? 
      (Deno.env.get('STRIPE_TEST_PRODUCT_ID') || 'prod_test_lucid_access') : 
      'prod_SefSK4P6W4Wzvn'
    
    console.log(`Using ${isTestMode ? 'TEST' : 'LIVE'} mode with product ID: ${productId}`)
    
    // Get user's Stripe customer ID
    let user = null
    let userError = null
    
    // Try to find user by ID first
    if (userId) {
      const result = await supabase
        .from('users')
        .select('stripe_customer_id, id')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to avoid 406 errors
      
      user = result.data
      userError = result.error
    }
    
    // If no user found by ID, try by email
    if ((!user || userError) && email) {
      console.log('No user found by ID, trying by email:', email)
      const result = await supabase
        .from('users')
        .select('stripe_customer_id, id')
        .eq('email', email)
        .maybeSingle() // Use maybeSingle to avoid 406 errors
      
      user = result.data
      userError = result.error
    }
    
    // If still no user, try by visitor ID
    if ((!user || userError) && visitorId) {
      console.log('No user found by email, trying by visitor ID:', visitorId)
      const result = await supabase
        .from('users')
        .select('stripe_customer_id, id')
        .eq('visitor_id', visitorId)
        .maybeSingle() // Use maybeSingle to avoid 406 errors
      
      user = result.data
      userError = result.error
    }
    
    if (userError || !user?.stripe_customer_id) {
      console.error('Error fetching user or no Stripe customer ID:', userError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User not found or no Stripe customer ID' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Update Stripe customer with phone number
    try {
      const customer = await stripe.customers.update(user.stripe_customer_id, {
        phone: phoneNumber,
        metadata: {
          phone_verified: 'true',
          phone_verified_at: new Date().toISOString(),
          product_id: productId // Use appropriate product ID based on mode
        }
      })
      
      console.log(`Updated Stripe customer ${customer.id} with phone ${phoneNumber}`)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          customerId: customer.id
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
    console.error('Error in update-stripe-customer-phone:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})