import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneVerification, OTPVerification, VerificationSuccess } from '@/components/phone-verification';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

type VerificationStep = 'loading' | 'phone' | 'otp' | 'success';

export default function VerifyPhonePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<VerificationStep>('loading');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Skip checks for local development only
      // Comment out these lines for production testing
      // if (process.env.NODE_ENV === 'development') {
      //   setStep('phone');
      //   setUserId('test-user-id');
      //   setUserEmail('test@example.com');
      //   return;
      // }
      
      // Get user ID from URL params (passed from checkout success)
      const paramUserId = searchParams.get('userId');
      const sessionId = searchParams.get('session_id');
      const paymentIntent = searchParams.get('payment_intent');
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
      const redirectStatus = searchParams.get('redirect_status');
      
      // Log all params for debugging
      console.log('Verify phone params:', {
        userId: paramUserId,
        sessionId,
        paymentIntent,
        paymentIntentClientSecret,
        redirectStatus,
        allParams: Object.fromEntries(searchParams.entries())
      });
      
      let userData: any = null;
      
      // If we have payment intent from Stripe redirect, get user from localStorage
      if (paymentIntent && !paramUserId) {
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
          console.log('Using stored user ID:', storedUserId);
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', storedUserId)
            .single();
          
          userData = user;
        }
      } else if (!paramUserId && !sessionId && !paymentIntent) {
        console.error('No user ID, session ID, or payment intent provided');
        navigate('/');
        return;
      }

      // Only fetch userData if we haven't already set it from payment intent flow
      if (!userData) {
        // If we have a session ID, look up the user by that
        if (sessionId) {
          const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('subscription_id', sessionId);
          
          userData = users?.[0];
        } else if (paramUserId) {
          // Otherwise use the user ID
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', paramUserId)
            .maybeSingle();
          
          if (user && !userError) {
            userData = user;
          }
        }
      }

      // If we have a payment intent but no user data, wait for user to be created
      if (!userData && paymentIntent) {
        console.log('No user data found but payment intent exists');
        
        // Try to find user by payment intent ID
        const { data: userByPayment, error: paymentError } = await supabase
          .from('users')
          .select('*')
          .eq('payment_intent_id', paymentIntent)
          .maybeSingle();
        
        if (userByPayment && !paymentError) {
          userData = userByPayment;
          console.log('Found user by payment intent ID:', userData.id);
          localStorage.setItem('user_id', userData.id);
        } else {
          // Try to find by visitor ID as fallback
          const visitorId = localStorage.getItem('lucid_visitor_id');
          if (visitorId) {
            const { data: userByVisitor } = await supabase
              .from('users')
              .select('*')
              .eq('visitor_id', visitorId)
              .eq('payment_completed', true)
              .maybeSingle();
            
            if (userByVisitor) {
              userData = userByVisitor;
              console.log('Found user by visitor ID:', userData.id);
              localStorage.setItem('user_id', userData.id);
            } else {
              // User might still be creating, proceed with temporary data
              userData = {
                id: paramUserId || 'temp-' + Date.now(),
                is_premium: true,
                payment_completed: true
              };
              console.log('Using temporary user data');
            }
          } else {
            // User might still be creating, proceed with temporary data
            userData = {
              id: paramUserId || 'temp-' + Date.now(),
              is_premium: true,
              payment_completed: true
            };
            console.log('Using temporary user data');
          }
        }
      } else if (!userData || (!userData.is_premium && !userData.payment_completed)) {
        console.error('User not found or payment not completed');
        navigate('/');
        return;
      }

      // Check if already verified
      if (userData.phone_verified && userData.phone_number) {
        setStep('success');
      } else {
        setStep('phone');
      }

      setUserId(userData.id);
      setUserEmail(userData.email);
    } catch (error) {
      console.error('Error checking payment status:', error);
      navigate('/');
    }
  };

  const handlePhoneComplete = (phone: string) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOTPSuccess = () => {
    setStep('success');
  };

  const handleBack = () => {
    setStep('phone');
    setPhoneNumber('');
  };

  // Mobile-optimized container with proper viewport handling
  const containerClass = "min-h-screen bg-gray-50 flex flex-col";
  const contentClass = "flex-1 flex items-center justify-center px-4 py-8 md:py-12";

  if (step === 'loading') {
    return (
      <div className={containerClass}>
        <div className={contentClass}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass} style={{ backgroundColor: '#FAFAFC' }}>
      <div className={contentClass}>
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-purple-600" style={{ color: '#8B7CF6' }}>
              Lucid
            </h1>
          </motion.div>

          {/* Card Container */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {step === 'phone' && userId && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PhoneVerification
                    userId={userId}
                    onComplete={handlePhoneComplete}
                  />
                </motion.div>
              )}
              
              {step === 'otp' && userId && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OTPVerification
                    phoneNumber={phoneNumber}
                    userId={userId}
                    onSuccess={handleOTPSuccess}
                    onBack={handleBack}
                  />
                </motion.div>
              )}
              
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <VerificationSuccess />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* User Email Display (for context) */}
          {userEmail && step !== 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-500 mt-4"
            >
              Verifying for: {userEmail}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}