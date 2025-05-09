-- Add Stripe customer ID field to users table
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Update comments
COMMENT ON COLUMN users.stripe_customer_id IS 'The customer ID in Stripe';
COMMENT ON COLUMN users.subscription_id IS 'The subscription ID in Stripe'; 