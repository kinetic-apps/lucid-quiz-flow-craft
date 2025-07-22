# Web-to-App Authentication Implementation Steps

## Overview
This document provides a step-by-step implementation guide for enabling web Stripe purchases to grant access to the Lucid mobile app through phone verification.

## Current State
- **Web Database**: Basic user table with email and subscription info, NO phone authentication
- **Mobile App**: Uses RevenueCat for subscriptions, Supabase Auth for phone authentication
- **Gap**: No connection between web purchases and mobile app access

## Implementation Phases

---

## Phase 1: Web Database Setup (Day 1)

### Step 1.1: Create Database Migration File
**File**: `supabase/migrations/003_add_phone_auth_fields.sql`

```sql
-- Add phone authentication fields to users table
ALTER TABLE users 
ADD COLUMN phone_number TEXT,
ADD COLUMN phone_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN supabase_user_id UUID,
ADD COLUMN stripe_customer_id TEXT;

-- Create indexes for performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Create auth_links table for cross-database account linking
CREATE TABLE IF NOT EXISTS auth_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  web_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  supabase_user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  linked_via TEXT DEFAULT 'phone',
  metadata JSONB DEFAULT '{}',
  UNIQUE(web_user_id, supabase_user_id)
);

-- Create indexes for auth_links
CREATE INDEX idx_auth_links_web_user ON auth_links(web_user_id);
CREATE INDEX idx_auth_links_supabase_user ON auth_links(supabase_user_id);
CREATE INDEX idx_auth_links_phone ON auth_links(phone_number);

-- Enable RLS on auth_links
ALTER TABLE auth_links ENABLE ROW LEVEL SECURITY;

-- RLS policy for auth_links
CREATE POLICY "Users can read own auth links" ON auth_links
  FOR SELECT
  USING (true);

-- Function to check web purchases by phone number
CREATE OR REPLACE FUNCTION check_web_purchase_by_phone(
  p_phone_number TEXT
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Find user with verified phone and active subscription
  SELECT * INTO v_user
  FROM users
  WHERE phone_number = p_phone_number
    AND phone_verified = true
    AND is_premium = true
    AND subscription_end_date > NOW()
  LIMIT 1;
    
  IF v_user IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'No active subscription found'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'user_id', v_user.id,
    'email', v_user.email,
    'subscription_plan', v_user.subscription_plan,
    'subscription_end_date', v_user.subscription_end_date,
    'stripe_customer_id', v_user.stripe_customer_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_web_purchase_by_phone TO anon, authenticated;
```

### Step 1.2: Apply Migration
```bash
# Apply migration to Supabase
cd /path/to/lucid-quiz-flow-craft
npx supabase db push
```

**Verification**:
- [ ] Check that all columns were added to users table
- [ ] Verify auth_links table was created
- [ ] Test check_web_purchase_by_phone function

---

## Phase 2: Web Phone Verification Components (Days 1-2)

### Step 2.1: Create Phone Verification Component
**File**: `src/components/PhoneVerification.tsx`

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

interface PhoneVerificationProps {
  userId: string;
  onComplete: (phoneNumber: string) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  userId,
  onComplete
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    // Validate phone number
    if (!isValidPhoneNumber(phoneNumber, countryCode)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse to E.164 format
      const parsed = parsePhoneNumber(phoneNumber, countryCode);
      const e164Phone = parsed.format('E.164');

      // Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
      });

      if (error) throw error;

      // Move to OTP verification step
      onComplete(e164Phone);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      console.error('OTP send error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Phone Number</h2>
        <p className="text-gray-600">
          Enter your phone number to access your subscription in the Lucid app
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <select 
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="US">🇺🇸 +1</option>
            <option value="GB">🇬🇧 +44</option>
            <option value="CA">🇨🇦 +1</option>
            {/* Add more country codes */}
          </select>
          
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(555) 123-4567"
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          onClick={handleSendOTP}
          disabled={loading || !phoneNumber}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </div>
    </motion.div>
  );
};
```

### Step 2.2: Create OTP Verification Component
**File**: `src/components/OTPVerification.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface OTPVerificationProps {
  phoneNumber: string;
  userId: string;
  onSuccess: () => void;
  onResend: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  userId,
  onSuccess,
  onResend
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      // Verify OTP with Supabase
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: code,
        type: 'sms',
      });

      if (error) throw error;

      // Update user record with verified phone
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone_number: phoneNumber,
          phone_verified: true,
          phone_verified_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Enter Verification Code</h2>
        <p className="text-gray-600">
          We sent a 6-digit code to {phoneNumber}
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl border rounded-lg focus:border-purple-500 focus:outline-none"
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-gray-500">Resend code in {countdown}s</p>
        ) : (
          <button
            onClick={onResend}
            className="text-purple-600 font-medium"
          >
            Resend Code
          </button>
        )}
      </div>
    </motion.div>
  );
};
```

### Step 2.3: Create Verification Success Component
**File**: `src/components/VerificationSuccess.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export const VerificationSuccess: React.FC = () => {
  const iosLink = "https://apps.apple.com/app/lucid/id[YOUR_APP_ID]";
  const androidLink = "https://play.google.com/store/apps/details?id=com.lucid";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Phone Verified!</h2>
        <p className="text-gray-600 mb-6">
          Your subscription is ready. Download the Lucid app and sign in with this phone number.
        </p>
      </div>

      <div className="space-y-4">
        <a
          href={iosLink}
          className="block w-full bg-black text-white py-3 rounded-lg font-medium"
        >
          Download for iOS
        </a>
        
        <a
          href={androidLink}
          className="block w-full bg-black text-white py-3 rounded-lg font-medium"
        >
          Download for Android
        </a>
      </div>

      <div className="mt-8 p-4 bg-purple-50 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="text-left text-sm space-y-1">
          <li>1. Download the Lucid app</li>
          <li>2. Open the app and tap "Sign In"</li>
          <li>3. Use the same phone number you just verified</li>
          <li>4. Your premium access will be automatically activated</li>
        </ol>
      </div>
    </motion.div>
  );
};
```

**Verification**:
- [ ] Phone number validation works correctly
- [ ] OTP sending triggers successfully
- [ ] OTP verification completes properly
- [ ] Success page displays correctly

---

## Phase 3: Web Phone Verification Page (Day 2)

### Step 3.1: Create Phone Verification Page
**File**: `src/pages/checkout/verify-phone.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PhoneVerification } from '@/components/PhoneVerification';
import { OTPVerification } from '@/components/OTPVerification';
import { VerificationSuccess } from '@/components/VerificationSuccess';
import { supabase } from '@/lib/supabase';

type VerificationStep = 'phone' | 'otp' | 'success';

export default function VerifyPhonePage() {
  const router = useRouter();
  const [step, setStep] = useState<VerificationStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Get user from URL params or session
      const { userId: paramUserId } = router.query;
      
      if (!paramUserId) {
        router.push('/');
        return;
      }

      // Verify user has completed payment
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', paramUserId)
        .single();

      if (!user || !user.is_premium) {
        router.push('/');
        return;
      }

      // Check if already verified
      if (user.phone_verified) {
        setStep('success');
      }

      setUserId(user.id);
    } catch (error) {
      console.error('Error checking payment status:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneComplete = (phone: string) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOTPSuccess = () => {
    setStep('success');
  };

  const handleResendOTP = () => {
    setStep('phone');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {step === 'phone' && userId && (
          <PhoneVerification
            userId={userId}
            onComplete={handlePhoneComplete}
          />
        )}
        
        {step === 'otp' && userId && (
          <OTPVerification
            phoneNumber={phoneNumber}
            userId={userId}
            onSuccess={handleOTPSuccess}
            onResend={handleResendOTP}
          />
        )}
        
        {step === 'success' && <VerificationSuccess />}
      </div>
    </div>
  );
}
```

### Step 3.2: Update Checkout Success Redirect
**File**: `src/pages/checkout/success.tsx`

```typescript
// Add to success page after payment confirmation
useEffect(() => {
  if (paymentComplete && userId) {
    // Redirect to phone verification
    router.push(`/checkout/verify-phone?userId=${userId}`);
  }
}, [paymentComplete, userId]);
```

**Verification**:
- [ ] Page only accessible after payment
- [ ] Phone verification flow works end-to-end
- [ ] Success page shows download links

---

## Phase 4: Update Stripe Webhook (Day 3)

### Step 4.1: Enhance Stripe Webhook Handler
**File**: `supabase/functions/stripe-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Update user with Stripe customer ID and mark for phone verification
      const { error } = await supabase
        .from('users')
        .update({
          stripe_customer_id: session.customer as string,
          subscription_id: session.subscription as string,
          is_premium: true,
          subscription_start_date: new Date().toISOString(),
          // Add phone verification requirement
          phone_verification_required: true
        })
        .eq('email', session.customer_email)

      if (error) {
        console.error('Error updating user:', error)
      }
      
      break
    }
    
    // Handle other webhook events...
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

**Verification**:
- [ ] Webhook updates user with stripe_customer_id
- [ ] Phone verification requirement is set
- [ ] Premium status is activated

---

## Phase 5: Mobile App Integration (Days 4-5)

### Step 5.1: Create Web Purchase Service
**File**: `lucid/lib/webPurchaseService.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Web database credentials (store securely)
const WEB_SUPABASE_URL = process.env.EXPO_PUBLIC_WEB_SUPABASE_URL || '';
const WEB_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_WEB_SUPABASE_ANON_KEY || '';

export const webSupabase = createClient(WEB_SUPABASE_URL, WEB_SUPABASE_ANON_KEY);

export interface WebPurchaseResult {
  success: boolean;
  user_id?: string;
  email?: string;
  subscription_plan?: string;
  subscription_end_date?: string;
  stripe_customer_id?: string;
  message?: string;
}

export const checkWebPurchase = async (phoneNumber: string): Promise<WebPurchaseResult | null> => {
  try {
    console.log('[webPurchaseService] Checking web purchase for phone:', phoneNumber);
    
    const { data, error } = await webSupabase.rpc('check_web_purchase_by_phone', {
      p_phone_number: phoneNumber
    });

    if (error) {
      console.error('[webPurchaseService] Error checking web purchase:', error);
      return null;
    }

    return data as WebPurchaseResult;
  } catch (error) {
    console.error('[webPurchaseService] Failed to check web purchase:', error);
    return null;
  }
};

export const linkWebPurchaseToApp = async (
  webUserId: string,
  appUserId: string,
  phoneNumber: string
): Promise<boolean> => {
  try {
    const { error } = await webSupabase
      .from('auth_links')
      .insert({
        web_user_id: webUserId,
        supabase_user_id: appUserId,
        phone_number: phoneNumber,
        linked_via: 'phone'
      });

    if (error) {
      console.error('[webPurchaseService] Error linking accounts:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[webPurchaseService] Failed to link accounts:', error);
    return false;
  }
};
```

### Step 5.2: Update Auth Success Handler
**File**: `lucid/app/auth.tsx`

```typescript
import { checkWebPurchase, linkWebPurchaseToApp } from '../lib/webPurchaseService';

const handleAuthSuccess = async () => {
  console.log("[auth.tsx] AuthScreen success, starting sync process...");
  
  try {
    // Existing auth sync code...
    await new Promise(resolve => setTimeout(resolve, 500));
    const userId = await identityManager.syncWithSupabase();
    
    // Get authenticated user details
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check for web purchases if user signed in with phone
    if (user?.phone) {
      console.log("[auth.tsx] Checking for web purchases with phone:", user.phone);
      
      const webPurchase = await checkWebPurchase(user.phone);
      
      if (webPurchase?.success) {
        console.log("[auth.tsx] Found web purchase:", webPurchase);
        
        // Link accounts
        if (webPurchase.user_id) {
          await linkWebPurchaseToApp(
            webPurchase.user_id,
            userId,
            user.phone
          );
        }
        
        // Update subscription status
        const expirationDate = new Date(webPurchase.subscription_end_date!);
        useUserStore.getState().setSubscriptionStatus(
          "active",
          expirationDate.toISOString()
        );
        
        // Track successful web purchase restoration
        analytics.track({
          name: AnalyticsEvent.WEB_PURCHASE_RESTORED,
          properties: {
            user_id: userId,
            subscription_plan: webPurchase.subscription_plan,
            source: "phone_auth"
          },
        });
        
        console.log("[auth.tsx] Web purchase restored, navigating to main app");
        router.replace("/(tabs)");
        return;
      }
    }
    
    // Continue with existing RevenueCat flow...
    // (existing code remains the same)
    
  } catch (error) {
    console.error("[auth.tsx] Error during auth sync:", error);
    router.replace("/");
  }
};
```

### Step 5.3: Add Restore Option to Paywall
**File**: `lucid/components/paywalls/PaywallRenderer.tsx`

```typescript
// Add restore web purchase button
const RestoreWebPurchaseButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    setLoading(true);
    
    try {
      // Navigate to auth screen for phone verification
      router.push('/auth?restore=true');
    } catch (error) {
      console.error('Error initiating restore:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRestore}
      disabled={loading}
      style={styles.restoreButton}
    >
      <Text style={styles.restoreText}>
        {loading ? 'Loading...' : 'Restore Web Purchase'}
      </Text>
    </TouchableOpacity>
  );
};
```

**Verification**:
- [ ] Web purchase check works correctly
- [ ] Account linking successful
- [ ] Subscription status updates properly
- [ ] User can access premium features

---

## Phase 6: Edge Functions (Day 4)

### Step 6.1: Create Cross-Database Function
**File**: `supabase/functions/verify-web-purchase/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone_number, app_user_id } = await req.json()
    
    // Create web database client
    const webSupabase = createClient(
      Deno.env.get('WEB_SUPABASE_URL') ?? '',
      Deno.env.get('WEB_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Check for web purchase
    const { data: purchase } = await webSupabase.rpc('check_web_purchase_by_phone', {
      p_phone_number: phone_number
    })
    
    if (purchase?.success) {
      // Create link between accounts
      await webSupabase
        .from('auth_links')
        .insert({
          web_user_id: purchase.user_id,
          supabase_user_id: app_user_id,
          phone_number: phone_number
        })
    }
    
    return new Response(
      JSON.stringify(purchase),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

**Verification**:
- [ ] Edge function deploys successfully
- [ ] CORS headers work correctly
- [ ] Cross-database queries function properly

---

## Phase 7: Testing & Deployment (Day 6)

### Step 7.1: Testing Checklist

#### Web Testing
- [ ] Phone verification UI displays correctly
- [ ] OTP sends and verifies successfully
- [ ] Phone number stored in correct format (E.164)
- [ ] Success page shows app download links
- [ ] Stripe webhook updates user correctly

#### Mobile Testing
- [ ] Phone auth triggers web purchase check
- [ ] Web purchases grant app access
- [ ] Subscription status updates correctly
- [ ] RevenueCat doesn't conflict with web purchases
- [ ] Restore option works from paywall

#### Integration Testing
- [ ] Complete flow: Web purchase → Phone verify → App access
- [ ] Multiple device scenarios work
- [ ] Expired subscriptions handled correctly
- [ ] Error cases show appropriate messages

### Step 7.2: Deployment Steps

1. **Deploy Database Changes**
   ```bash
   npx supabase db push --project-ref tcmwpmjjutlziudlwiau
   ```

2. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy verify-web-purchase
   ```

3. **Deploy Web App**
   ```bash
   npm run build
   npm run deploy
   ```

4. **Update Mobile App**
   ```bash
   cd lucid
   eas build --platform all
   eas submit
   ```

### Step 7.3: Environment Variables

**Web App** (`.env.local`):
```
VITE_SUPABASE_URL=https://tcmwpmjjutlziudlwiau.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

**Mobile App** (`.env`):
```
EXPO_PUBLIC_SUPABASE_URL=https://yvqaqmhdivxhdhxgrhrb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_app_anon_key
EXPO_PUBLIC_WEB_SUPABASE_URL=https://tcmwpmjjutlziudlwiau.supabase.co
EXPO_PUBLIC_WEB_SUPABASE_ANON_KEY=your_web_anon_key
```

---

## Troubleshooting

### Common Issues

1. **"OTP not received"**
   - Check Supabase SMS provider status
   - Verify phone number format
   - Check rate limiting (1 per minute)

2. **"Phone already verified"**
   - Check if phone exists in database
   - Provide account recovery option

3. **"Subscription not found in app"**
   - Verify phone numbers match exactly
   - Check subscription dates
   - Ensure web purchase check runs

4. **"Failed to link accounts"**
   - Check CORS configuration
   - Verify edge function permissions
   - Check auth_links unique constraints

### Debug Commands

```bash
# Check web database
npx supabase db remote commit --project-ref tcmwpmjjutlziudlwiau

# View edge function logs
npx supabase functions logs verify-web-purchase

# Test phone verification
curl -X POST https://tcmwpmjjutlziudlwiau.supabase.co/functions/v1/verify-web-purchase \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "app_user_id": "uuid"}'
```

---

## Success Metrics

- [ ] 90%+ of web purchasers complete phone verification
- [ ] <5% support tickets for access issues
- [ ] <30s average time to verify phone
- [ ] 95%+ success rate for app access after verification

## Next Steps

1. Monitor error rates and user feedback
2. Add analytics tracking for conversion funnel
3. Implement automated testing
4. Consider email-based fallback option
5. Add admin dashboard for manual account linking