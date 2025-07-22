import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Smartphone, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

export const VerificationSuccess: React.FC = () => {
  const iosLink = "https://apps.apple.com/app/lucid/id[YOUR_APP_ID]";
  const androidLink = "https://play.google.com/store/apps/details?id=com.lucid";

  useEffect(() => {
    // Ensure user record is properly updated after verification
    const ensureUserRecord = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.phone) {
          // Try to get existing user ID
          let userId = localStorage.getItem('user_id');
          
          // If it's a temporary ID or missing, try to find/create user
          if (!userId || userId.startsWith('temp-')) {
            const visitorId = localStorage.getItem('lucid_visitor_id');
            const userEmail = localStorage.getItem('user_email');
            
            // First try to find user by visitor ID
            if (visitorId) {
              const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('visitor_id', visitorId)
                .single();
              
              if (existingUser) {
                userId = existingUser.id;
                localStorage.setItem('user_id', userId);
              }
            }
            
            // If still no user, create one
            if (!userId || userId.startsWith('temp-')) {
              const { data: newUser, error } = await supabase
                .from('users')
                .insert({
                  email: userEmail || undefined,
                  visitor_id: visitorId || undefined,
                  phone_number: session.user.phone,
                  phone_verified: true,
                  phone_verified_at: new Date().toISOString(),
                  payment_completed: true,
                  is_premium: true
                })
                .select()
                .single();
              
              if (newUser && !error) {
                userId = newUser.id;
                localStorage.setItem('user_id', userId);
                console.log('Created user record after phone verification:', userId);
              }
            }
          }
          
          // Update existing user with phone if we have a valid ID
          if (userId && !userId.startsWith('temp-')) {
            await supabase
              .from('users')
              .update({
                phone_number: session.user.phone,
                phone_verified: true,
                phone_verified_at: new Date().toISOString()
              })
              .eq('id', userId);
          }
        }
      } catch (error) {
        console.error('Error ensuring user record:', error);
      }
    };
    
    ensureUserRecord();
    
    // Trigger confetti animation on mount
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8B7CF6', '#9F8FFF', '#B5A7FF', '#F0EBFF']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8B7CF6', '#9F8FFF', '#B5A7FF', '#F0EBFF']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.1, 
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
        className="mb-6"
      >
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-green-100 rounded-full blur-xl"></div>
          <CheckCircle className="w-20 h-20 md:w-24 md:h-24 text-green-500 relative" />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Phone Verified Successfully!
        </h2>
        <p className="text-gray-600 text-base md:text-lg">
          Your premium subscription is ready to use
        </p>
      </motion.div>

      {/* App Download Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 mb-8"
      >
        <div className="bg-purple-50 rounded-2xl p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <Smartphone className="w-12 h-12 text-purple-600" />
          </div>
          
          <h3 className="font-semibold text-lg text-gray-900 mb-4">
            Download the Lucid App
          </h3>

          {/* App Store Buttons */}
          <div className="space-y-3">
            <a
              href={iosLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-medium transition-colors group"
            >
              <span className="flex items-center justify-center gap-3">
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Download for iOS
              </span>
            </a>
            
            <a
              href={androidLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-medium transition-colors group"
            >
              <span className="flex items-center justify-center gap-3">
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Download for Android
              </span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-xl p-6 text-left"
      >
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-purple-600">✨</span>
          Next Steps
        </h4>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-purple-600 font-semibold">1.</span>
            Download and open the Lucid app
          </li>
          <li className="flex gap-2">
            <span className="text-purple-600 font-semibold">2.</span>
            Tap "Sign In" on the welcome screen
          </li>
          <li className="flex gap-2">
            <span className="text-purple-600 font-semibold">3.</span>
            Use the same phone number you just verified
          </li>
          <li className="flex gap-2">
            <span className="text-purple-600 font-semibold">4.</span>
            Your premium access will activate automatically
          </li>
        </ol>
      </motion.div>

      {/* Support Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-gray-500 mt-6"
      >
        Need help? <a href="mailto:support@lucid.app" className="text-purple-600 hover:text-purple-700 font-medium">Contact Support</a>
      </motion.p>
    </motion.div>
  );
};