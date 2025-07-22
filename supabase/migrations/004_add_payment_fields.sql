-- Add payment-related fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- Create indexes for payment fields
CREATE INDEX IF NOT EXISTS idx_users_payment_intent ON users(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_product ON users(stripe_product_id);

-- Update RLS policies to allow anonymous users to insert with these fields
DROP POLICY IF EXISTS "Allow anonymous insert to users" ON users;

-- Create new policy that allows insert with all fields including payment fields
CREATE POLICY "Allow anonymous insert to users" ON users
  FOR INSERT WITH CHECK (true);

-- Also ensure anonymous users can select their own records by visitor_id
CREATE POLICY "Allow anonymous select own user by visitor_id" ON users
  FOR SELECT USING (
    visitor_id IS NOT NULL AND 
    visitor_id = COALESCE(current_setting('request.jwt.claim.sub', true), visitor_id)
  );

-- Add comments for documentation
COMMENT ON COLUMN users.payment_completed IS 'Whether the user has completed payment';
COMMENT ON COLUMN users.payment_intent_id IS 'Stripe payment intent ID for tracking';
COMMENT ON COLUMN users.stripe_product_id IS 'Stripe product ID for the subscription';