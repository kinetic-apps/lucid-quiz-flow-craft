-- Add phone authentication fields to users table
ALTER TABLE users 
ADD COLUMN phone_number TEXT,
ADD COLUMN phone_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN supabase_user_id UUID;

-- Create index for phone number lookups
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_supabase_user_id ON users(supabase_user_id);

-- Create auth_links table for linking web users with app users
CREATE TABLE IF NOT EXISTS auth_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  web_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  supabase_user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  linked_via TEXT DEFAULT 'phone', -- phone, email, or apple
  metadata JSONB DEFAULT '{}',
  UNIQUE(web_user_id, supabase_user_id)
);

-- Create indexes for auth_links
CREATE INDEX idx_auth_links_web_user ON auth_links(web_user_id);
CREATE INDEX idx_auth_links_supabase_user ON auth_links(supabase_user_id);
CREATE INDEX idx_auth_links_phone ON auth_links(phone_number);

-- Add RLS policies for auth_links table
ALTER TABLE auth_links ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own auth links
CREATE POLICY "Users can read own auth links" ON auth_links
  FOR SELECT
  USING (
    supabase_user_id = auth.uid() 
    OR web_user_id IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- Policy for service role to manage auth links
CREATE POLICY "Service role can manage auth links" ON auth_links
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Add function to link accounts by phone number
CREATE OR REPLACE FUNCTION link_web_purchase_to_app_user(
  p_phone_number TEXT,
  p_supabase_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_web_user RECORD;
  v_auth_link RECORD;
  v_result JSON;
BEGIN
  -- Find web user with this phone number
  SELECT * INTO v_web_user
  FROM users
  WHERE phone_number = p_phone_number
    AND phone_verified = true
    AND subscription_end_date > NOW()
  LIMIT 1;
  
  IF v_web_user IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No active subscription found for this phone number'
    );
  END IF;
  
  -- Check if already linked
  SELECT * INTO v_auth_link
  FROM auth_links
  WHERE web_user_id = v_web_user.id
    AND supabase_user_id = p_supabase_user_id;
  
  IF v_auth_link IS NOT NULL THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Accounts already linked',
      'subscription', json_build_object(
        'plan', v_web_user.subscription_plan,
        'end_date', v_web_user.subscription_end_date,
        'stripe_customer_id', v_web_user.stripe_customer_id
      )
    );
  END IF;
  
  -- Create auth link
  INSERT INTO auth_links (
    web_user_id,
    supabase_user_id,
    phone_number,
    linked_via
  ) VALUES (
    v_web_user.id,
    p_supabase_user_id,
    p_phone_number,
    'phone'
  );
  
  -- Update web user with supabase_user_id
  UPDATE users
  SET supabase_user_id = p_supabase_user_id
  WHERE id = v_web_user.id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Account successfully linked',
    'subscription', json_build_object(
      'plan', v_web_user.subscription_plan,
      'end_date', v_web_user.subscription_end_date,
      'stripe_customer_id', v_web_user.stripe_customer_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION link_web_purchase_to_app_user TO authenticated;