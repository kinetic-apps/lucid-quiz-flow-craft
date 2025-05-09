import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Invalid checkout session",
        variant: "destructive",
        duration: 5000,
      });
      navigate('/checkout');
      return;
    }

    // Show success toast
    toast({
      title: "Payment Successful!",
      description: "Your subscription has been activated.",
      duration: 5000,
    });

    // Start countdown to redirect to home
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
  }, [sessionId, navigate, toast]);

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
          onClick={() => navigate('/')}
          className="mt-6 w-full bg-[#7c3aed] text-white py-3 rounded-lg font-bold"
        >
          Go to Home
        </button>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccessPage; 