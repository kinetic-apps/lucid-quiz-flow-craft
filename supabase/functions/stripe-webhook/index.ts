// Follow this setup guide to integrate the Deno runtime with Supabase
// https://deno.com/manual/runtime/supabase

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import Stripe from 'https://esm.sh/stripe@14.1.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

// Helper function to update user subscription details
async function updateUserSubscription(
  userId: string,
  subscriptionId: string,
  customerId: string,
  plan: string,
  startDate: string,
  endDate: string
) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        subscription_plan: plan,
        subscription_start_date: startDate,
        subscription_end_date: endDate,
        is_premium: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    return false;
  }
}

// Helper function to find user by customer ID
async function findUserByCustomerId(customerId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error) {
      console.error('Error finding user by customer ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to find user by customer ID:', error);
    return null;
  }
}

// Helper function to find user by email
async function findUserByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error finding user by email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to find user by email:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
      },
    })
  }

  // Only handle POST requests for the webhook
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Get the request body for verification
    const reqBody = await req.text()
    
    // Get the Stripe signature from headers
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      console.error('No Stripe signature found in request headers')
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify the webhook signature using the async method
    const event = await stripe.webhooks.constructEventAsync(
      reqBody,
      signature,
      stripeWebhookSecret
    )

    console.log(`Received Stripe webhook event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Extract metadata
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        const productName = session.metadata?.productName
        
        if (!userId || !planId || !productName) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Get subscription details
        if (session.subscription && typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription)
          
          // Calculate end date based on current period end
          const startDate = new Date(subscription.current_period_start * 1000).toISOString()
          const endDate = new Date(subscription.current_period_end * 1000).toISOString()
          
          // Update user with subscription details
          await updateUserSubscription(
            userId,
            subscription.id,
            session.customer as string,
            productName,
            startDate,
            endDate
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID
        const user = await findUserByCustomerId(subscription.customer as string)
        
        if (!user) {
          console.error('User not found for customer ID:', subscription.customer)
          break
        }
        
        // Calculate new dates
        const startDate = new Date(subscription.current_period_start * 1000).toISOString()
        const endDate = new Date(subscription.current_period_end * 1000).toISOString()
        
        // Get product name from the first item in the subscription
        const price = await stripe.prices.retrieve(subscription.items.data[0].price.id)
        const product = await stripe.products.retrieve(price.product as string)
        
        // Update user with new subscription details
        await updateUserSubscription(
          user.id,
          subscription.id,
          subscription.customer as string,
          product.name,
          startDate,
          endDate
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID
        const user = await findUserByCustomerId(subscription.customer as string)
        
        if (!user) {
          console.error('User not found for customer ID:', subscription.customer)
          break
        }
        
        // Update user to remove premium status
        const { error } = await supabase
          .from('users')
          .update({
            is_premium: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (error) {
          console.error('Error updating user after subscription deletion:', error)
        }
        break
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        
        // If email exists, find user and update with Stripe customer ID
        if (customer.email) {
          const user = await findUserByEmail(customer.email)
          
          if (user) {
            const { error } = await supabase
              .from('users')
              .update({
                stripe_customer_id: customer.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
            
            if (error) {
              console.error('Error updating user with Stripe customer ID:', error)
            }
          }
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}) 