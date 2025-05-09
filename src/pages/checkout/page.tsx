import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { updateUserSubscription } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PRODUCTS } from '@/integrations/stripe/client';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const SUBSCRIPTION_PLANS = [
  {
    id: '7day',
    name: '7-DAY PLAN',
    totalPrice: 43.50,
    perDayPrice: 6.21,
    popular: false
  },
  {
    id: '1month',
    name: '1-MONTH PLAN',
    totalPrice: 43.50,
    perDayPrice: 1.45,
    popular: true
  },
  {
    id: '3month',
    name: '3-MONTH PLAN',
    totalPrice: 79.99,
    perDayPrice: 0.88,
    popular: false
  }
];

const GOALS = [
  "You wake up feeling energized",
  "You no longer feel overwhelmed or worried",
  "You're no longer stuck by overthinking",
  "You enhance your overall emotional well-being",
  "Boost your energy levels and achieve your goals",
  "Your self-confidence is at an all-time high"
];

const FEATURED_LOGOS = [
  "The New York Times",
  "THE WALL STREET JOURNAL",
  "Forbes",
  "CNN Health",
  "Vox"
];

const STATS = [
  {
    percent: "83%",
    text: "of users were able to improve their well-being after just 6 weeks"
  },
  {
    percent: "77%",
    text: "of users started with similar levels of energy levels as you"
  },
  {
    percent: "45%",
    text: "of users suffer from the same issues as you"
  }
];

const LIFE_WITHOUT = [
  "Feeling guilty for not being productive",
  "Scrolling on social media in the middle of a task",
  "Feeling uneasy when you have free time",
  "Feeling rushed at work",
  "Always checking phone for messages or notifications"
];

// Payment method logos
const PAYMENT_METHODS = [
  { name: 'PayPal', image: '/assets/paypal.svg' },
  { name: 'Apple Pay', image: '/assets/applepay.svg' },
  { name: 'Visa', image: '/assets/visa.svg' },
  { name: 'Mastercard', image: '/assets/mastercard.svg' },
  { name: 'Maestro', image: '/assets/maestro.svg' },
  { name: 'Discover', image: '/assets/discover.svg' },
  { name: 'American Express', image: '/assets/amex.svg' },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { visitorId } = useQuiz();
  const [selectedPlan, setSelectedPlan] = useState('1month');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get the email associated with the visitor ID from local storage (set during quiz)
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }

    // In a real app, you'd retrieve the user ID from the session or localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const getPlanDetails = () => {
    const plan = STRIPE_PRODUCTS[selectedPlan];
    if (!plan) return STRIPE_PRODUCTS['1month']; // Default to 1-month
    return plan;
  };

  const handleGetPlan = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const plan = getPlanDetails();
      
      if (!userEmail) {
        toast({
          title: "Email Required",
          description: "Please complete the quiz and provide your email before checking out.",
          variant: "destructive",
          duration: 5000,
        });
        setIsProcessing(false);
        return;
      }

      // Create a Stripe Checkout Session
      const response = await fetch('https://bsqmlzocdhummisrouzs.supabase.co/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: userId,
          email: userEmail,
          planId: selectedPlan,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#5d3f4a] flex flex-col">
      {/* Fixed header */}
      <div className="sticky top-0 z-10 w-full bg-white shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center p-4">
          <div className="font-bold text-xl">Lucid</div>
          <button
            className="bg-[#7c3aed] text-white px-6 py-2 rounded-full font-medium"
            onClick={handleGetPlan}
            disabled={isProcessing}
          >
            {isProcessing ? 'PROCESSING...' : 'GET MY PLAN'}
          </button>
        </div>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch pb-16">
        <div className="max-w-md mx-auto bg-[#f9f7f3]">
          {/* Before/After Section */}
          <div className="flex mb-2">
            <div className="flex-1 p-4 border-r border-gray-200">
              <div className="text-center mb-2">
                <div className="bg-green-100 rounded-full inline-block px-4 py-1">Now</div>
              </div>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" 
                  alt="Before" 
                  className="w-24 h-24 object-cover grayscale" 
                />
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <div>Energy level</div>
                  <div className="font-semibold">Low</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-1/4 h-2 bg-[#7c3aed] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div>Well-being level</div>
                  <div className="font-semibold">Weak</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-2/5 h-2 bg-[#7c3aed] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div>Self-esteem level</div>
                  <div className="font-semibold">Low</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1 relative">
                    <div className="w-1/3 h-2 bg-[#7c3aed] rounded-full"></div>
                    <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#7c3aed]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="text-center mb-2">
                <div className="bg-[#7c3aed] text-white rounded-full inline-block px-4 py-1">Your Goal</div>
              </div>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" 
                  alt="After" 
                  className="w-24 h-24 object-cover" 
                />
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <div>Energy level</div>
                  <div className="font-semibold">High</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-full h-2 bg-[#7c3aed] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div>Well-being level</div>
                  <div className="font-semibold">Strong</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="w-full h-2 bg-[#7c3aed] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div>Self-esteem level</div>
                  <div className="font-semibold">High</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1 relative">
                    <div className="w-full h-2 bg-[#7c3aed] rounded-full"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#7c3aed]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans Section */}
          <div className="px-6 py-8 bg-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Choose Your Plan</h2>
              <p className="text-gray-600">Select the plan that works best for you</p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(STRIPE_PRODUCTS).map(([id, plan]) => (
                <div 
                  key={id}
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    selectedPlan === id 
                      ? 'border-[#7c3aed] bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{plan.name}</div>
                      <div className="text-sm text-gray-500">${plan.perDayPrice.toFixed(2)}/day</div>
                    </div>
                    <div className="text-xl font-bold text-gray-800">${plan.totalPrice.toFixed(2)}</div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div 
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedPlan === id 
                          ? 'border-[#7c3aed] bg-[#7c3aed]' 
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPlan === id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {id === '1month' && 'Most popular'}
                      {id === '3month' && 'Best value'}
                      {id === '7day' && 'Trial plan'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              className="w-full mt-6 bg-[#7c3aed] text-white py-3 rounded-lg font-semibold"
              onClick={handleGetPlan}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Continue to Checkout'}
            </button>
            
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500 mb-2">Secure payment via</div>
              <div className="flex justify-center space-x-2">
                {PAYMENT_METHODS.map(method => (
                  <img 
                    key={method.name}
                    src={method.image} 
                    alt={method.name}
                    className="h-6 object-contain"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Our Goals */}
          <div className="p-4 bg-white mt-4">
            <h3 className="text-lg font-bold mb-4">What you'll achieve</h3>
            <ul className="space-y-3">
              {GOALS.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-2 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>{goal}</div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Featured Logos */}
          <div className="p-4 mt-4">
            <div className="text-center text-sm text-gray-500 mb-4">AS FEATURED IN</div>
            <div className="flex flex-wrap justify-center gap-4">
              {FEATURED_LOGOS.map((logo, index) => (
                <div key={index} className="text-gray-400 font-semibold text-xs">{logo}</div>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className="p-4 bg-white mt-4">
            <div className="space-y-4">
              {STATS.map((stat, index) => (
                <div key={index} className="flex items-center">
                  <div className="text-[#7c3aed] text-2xl font-bold mr-3">{stat.percent}</div>
                  <div className="text-sm">{stat.text}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Life Without Section */}
          <div className="p-4 mt-4">
            <h3 className="text-lg font-bold mb-4">Life without poor productivity habits</h3>
            <div className="bg-white p-4 rounded-lg">
              <ul className="space-y-3">
                {LIFE_WITHOUT.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-red-100 p-1 rounded-full mr-2 mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>{item}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="p-4 mt-4">
            <button 
              onClick={handleGetPlan} 
              className="w-full bg-[#7c3aed] text-white py-3 rounded-lg font-bold text-lg"
              disabled={isProcessing}
            >
              {isProcessing ? 'PROCESSING...' : 'GET MY PLAN'}
            </button>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              7-day money-back guarantee if you are not satisfied
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 