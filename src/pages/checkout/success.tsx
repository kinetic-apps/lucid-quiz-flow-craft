import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { usePostHog } from '@/context/PostHogContext';

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { visitorId } = useQuiz();
  const { track, identify } = usePostHog();
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    // Get search params from URL which Stripe might have added
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    
    // Get user info from localStorage
    const userId = localStorage.getItem('user_id') || undefined;
    const userEmail = localStorage.getItem('user_email') || undefined;
    
    // Track successful purchase
    track('purchase_successful', {
      visitor_id: visitorId,
      user_id: userId,
      user_email: userEmail,
      session_id: sessionId || undefined,
      page: 'checkout_success'
    });
    
    // If we have the email and userId, make sure user is identified
    if (userEmail && userId) {
      identify(visitorId, {
        email: userEmail,
        user_id: userId,
        has_subscription: true
      });
    }
    
    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate, track, identify, visitorId, location.search]);
  
  const handleGoHome = () => {
    // Track home navigation from success page
    track('navigate_from_success', {
      visitor_id: visitorId,
      destination: 'home',
      source: 'checkout_success'
    });
    
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f9f7f3] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your subscription has been activated.
        </p>

        <div className="p-4 bg-green-50 rounded-lg mb-6">
          <p className="text-green-700 font-medium">
            You now have full access to all premium features.
          </p>
        </div>

        <p className="text-gray-500 text-sm">
          Redirecting to home page in {countdown} seconds...
        </p>

        <button
          onClick={handleGoHome}
          className="mt-6 w-full bg-[#7c3aed] text-white py-3 rounded-lg font-bold"
        >
          Go to Home
        </button>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccessPage; 