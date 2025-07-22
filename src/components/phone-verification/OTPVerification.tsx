import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  userId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  userId,
  onSuccess,
  onBack
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) return;
    
    setLoading(true);
    setError('');

    console.log('Verifying OTP:', {
      phoneNumber,
      code,
      userId
    });

    try {
      // Verify OTP with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: code,
        type: 'sms',
      });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        console.error('Error details:', {
          message: verifyError.message,
          status: verifyError.status,
          phoneNumber,
          code
        });
        throw verifyError;
      }

      console.log('OTP verified successfully:', data);
      console.log('Current userId:', userId);
      console.log('Phone number to update:', phoneNumber);

      // Update user record with verified phone
      // Only update if we have a valid userId (not temporary)
      if (userId && !userId.startsWith('temp-')) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            phone_number: phoneNumber,
            phone_verified: true,
            phone_verified_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user record:', updateError);
          // Don't throw here - the phone is verified in Supabase Auth
        }
      } else {
        console.log('Skipping user record update - temporary or missing userId');
      }

      // Update Stripe customer with phone number
      // We need to find the Stripe customer even if we have a temporary userId
      console.log('=== Starting Stripe phone update ===');
      console.log('userId:', userId);
      console.log('phoneNumber:', phoneNumber);
      
      try {
        // First, try to find the user by visitor ID or email if we have a temp ID
        let actualUserId = userId;
        if (userId && userId.startsWith('temp-')) {
          const visitorId = localStorage.getItem('lucid_visitor_id');
          const userEmail = localStorage.getItem('user_email');
          
          // Try to find user by visitor ID first
          if (visitorId) {
            const { data: usersByVisitor, error: visitorError } = await supabase
              .from('users')
              .select('*')
              .eq('visitor_id', visitorId)
              .maybeSingle();
            
            if (usersByVisitor && !visitorError) {
              actualUserId = usersByVisitor.id;
              console.log('Found user by visitor ID:', actualUserId);
            } else if (userEmail) {
              // Try by email if visitor ID didn't work
              const { data: usersByEmail, error: emailError } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail)
                .maybeSingle();
              
              if (usersByEmail && !emailError) {
                actualUserId = usersByEmail.id;
                console.log('Found user by email:', actualUserId);
              } else {
                // Try by payment intent ID as last resort
                const searchParams = new URLSearchParams(window.location.search);
                const paymentIntent = searchParams.get('payment_intent');
                
                if (paymentIntent) {
                  const { data: userByPayment } = await supabase
                    .from('users')
                    .select('*')
                    .eq('payment_intent_id', paymentIntent)
                    .maybeSingle();
                  
                  if (userByPayment) {
                    actualUserId = userByPayment.id;
                    console.log('Found user by payment intent:', actualUserId);
                  } else {
                    console.log('No users found with visitor ID, email, or payment intent');
                  }
                } else {
                  console.log('No users found with visitor ID or email');
                }
              }
            }
          }
        }
        
        console.log('Final actualUserId for Stripe update:', actualUserId);
        
        // If we still have a valid user ID, update Stripe
        if (actualUserId && !actualUserId.startsWith('temp-')) {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-stripe-customer-phone`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              userId: actualUserId,
              phoneNumber,
              ...(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') && { testMode: true }),
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to update Stripe customer with phone:', errorText);
          } else {
            console.log('Successfully updated Stripe customer with phone number');
          }
        } else {
          // If we still don't have a valid user ID, try to update by phone number
          console.log('No valid user ID found, attempting to update Stripe by phone number');
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-stripe-customer-phone`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              phoneNumber,
              visitorId: localStorage.getItem('lucid_visitor_id'),
              email: localStorage.getItem('user_email'),
              ...(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') && { testMode: true }),
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to update Stripe customer with phone (no user ID):', errorText);
          } else {
            console.log('Successfully updated Stripe customer with phone number (found by email/visitor)');
          }
        }
      } catch (error) {
        console.error('Error calling update-stripe-customer-phone:', error);
        // Continue anyway - the phone is verified in our database
      }

      // Success animation before callback
      await new Promise(resolve => setTimeout(resolve, 500));
      onSuccess();
    } catch (err: any) {
      console.error('Verification error:', err);
      
      // Provide more specific error messages
      if (err?.message?.includes('Token has expired')) {
        setError('Verification code has expired. Please request a new one.');
      } else if (err?.message?.includes('Invalid')) {
        setError('Invalid verification code. Please check and try again.');
      } else {
        setError('Verification failed. Please try again.');
      }
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    setError('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;
      
      // Focus first input after resend
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setCanResend(true);
    }
  };

  // Format phone number for display
  const formatDisplayPhone = (phone: string) => {
    // Just show last 4 digits for privacy
    const lastFour = phone.slice(-4);
    return `•••• ${lastFour}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Back Button - Mobile Style */}
      <button
        onClick={onBack}
        className="mb-6 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2 text-gray-600"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Enter Verification Code
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          We sent a 6-digit code to {formatDisplayPhone(phoneNumber)}
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="flex gap-2 md:gap-3 justify-center mb-6">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`
              w-12 h-14 md:w-14 md:h-16 
              text-center text-xl md:text-2xl font-semibold
              border-2 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              transition-all duration-200
              ${digit ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white'}
              ${error ? 'border-red-400 shake' : ''}
              ${loading ? 'opacity-50' : ''}
            `}
            disabled={loading}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm text-center mb-4"
        >
          {error}
        </motion.p>
      )}

      {/* Resend Section */}
      <div className="text-center mb-6">
        {countdown > 0 ? (
          <p className="text-gray-500 text-sm">
            Resend code in <span className="font-semibold text-gray-700">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={!canResend}
            className="text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors disabled:opacity-50"
          >
            Resend Code
          </button>
        )}
      </div>

      {/* Verify Button - Only show when all digits entered */}
      {otp.every(digit => digit) && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: '#8B7CF6' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Verifying...
            </span>
          ) : (
            'Verify'
          )}
        </motion.button>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center mt-6">
        Didn't receive the code? Check your phone's spam folder or try resending.
      </p>

      {/* Add shake animation for errors */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </motion.div>
  );
};