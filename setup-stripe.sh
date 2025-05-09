#!/bin/bash

# Install Stripe.js for frontend integration
npm install @stripe/stripe-js

# Install Stripe for server-side API
npm install stripe

# Create environment variables file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating .env file with Stripe configuration"
  echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key" > .env
  echo "VITE_STRIPE_SECRET_KEY=sk_test_your_secret_key" >> .env
  echo "VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret" >> .env
fi

# Remind to update the keys
echo "Please update your Stripe API keys in the .env file"
echo "Setup complete!" 