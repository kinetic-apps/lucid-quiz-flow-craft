import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || '');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Product IDs are now managed in the Supabase Edge Function

// Webhook endpoint to handle Stripe events
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Note: This webhook is now redundant as we're using Supabase Edge Functions
  // This is kept for reference or local testing purposes only
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Extract metadata
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const productName = session.metadata?.productName;
      
      if (!userId || !planId || !productName) {
        console.error('Missing metadata in checkout session');
        break;
      }

      // Get subscription details
      if (session.subscription && typeof session.subscription === 'string') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Calculate end date based on current period end
        const startDate = new Date(subscription.current_period_start * 1000).toISOString();
        const endDate = new Date(subscription.current_period_end * 1000).toISOString();
        
        // Update user with subscription details
        const { error } = await supabase
          .from('users')
          .update({
            subscription_id: subscription.id,
            stripe_customer_id: session.customer,
            subscription_plan: productName,
            subscription_start_date: startDate,
            subscription_end_date: endDate,
            is_premium: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (error) {
          console.error('Error updating user subscription:', error);
        }
      }
      break;
      
    case 'customer.subscription.updated':
      // Logic for subscription updates
      break;
      
    case 'customer.subscription.deleted':
      // Logic for subscription cancellations
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 