import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { updateUserSubscription } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PRODUCTS } from '@/integrations/stripe/client';
import { loadStripe } from '@stripe/stripe-js';
import { usePostHog } from '@/context/PostHogContext';
import { useMobileScrollLock } from '@/hooks/use-mobile-scroll-lock';
import EmbeddedCheckout from '@/components/EmbeddedCheckout';
import { createStripePaymentIntent } from '@/integrations/stripe/client';
import PaymentRequestButton from '@/components/PaymentRequestButton';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const SUBSCRIPTION_PLANS = [
  {
    id: '7day',
    name: '7-DAY PLAN',
    originalPrice: 43.50,
    discountedPrice: 10.50,
    perDayPrice: 1.50,
    popular: false,
    label: 'Trial plan'
  },
  {
    id: '1month',
    name: '1-MONTH PLAN',
    originalPrice: 43.50,
    discountedPrice: 19.99,
    perDayPrice: 0.66,
    popular: true,
    label: 'Most popular'
  },
  {
    id: '3month',
    name: '3-MONTH PLAN',
    originalPrice: 79.99,
    discountedPrice: 34.99,
    perDayPrice: 0.38,
    popular: false,
    label: 'Best value'
  }
];

const DIFFICULTY = "Perfectionist";
const GOAL = "Well-being";

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
  "Always checking phone for messages or emails",
  "Lack of time for self care",
  "Problems with feeling rested",
  "Feeling tired and overwhelmed during the day"
];

const CAN_HELP_WITH = [
  "Continuous focus and concentration",
  "Elevated energy levels",
  "Improved sleep quality and schedule",
  "Emotional stability",
  "No guilt for getting relaxed",
  "Efficient performance at work",
  "Stable self-care routine"
];

const FAQ_ITEMS = [
  {
    question: "What if I don't have enough willpower to stick to the plan?",
    answer: "Our plan is designed to help you build your willpower gradually, so you don't have to rely on your own willpower too much in the beginning. We also provide support and guidance to help you stay motivated throughout the process."
  },
  {
    question: "What if I have too many distractions in my life?",
    answer: "We understand that life can be hectic, but our plan includes strategies to help you minimize distractions and stay focused on your goals. From setting clear priorities to creating a distraction-free environment, we'll help you develop habits that promote productivity."
  },
  {
    question: "What if I feel overwhelmed about starting this plan?",
    answer: "Starting anything new can be scary, but our plan is designed to be manageable and easy to follow. We'll help you break down your goals into small, actionable steps, and provide support and encouragement to help you stay motivated and overcome any obstacles that come up along the way."
  },
  {
    question: "What if I've tried tools before and they haven't worked for me?",
    answer: "Our plan stands apart from other options you've tried by incorporating the latest findings and time-tested methods. Drawing on insights from experienced professionals, it provides a personalized approach that focuses on your unique needs and challenges."
  }
];

const TESTIMONIALS = [
  {
    text: "It has really changed my life",
    name: "Brian Ross",
    content: "I have been using this app for six months now. During this time, I have been able to get rid of the habit of putting everything off until the last minute. The app has helped me to organize my time better and start achieving my goals. It has really changed my life for the better."
  },
  {
    text: "Lucid is a great self-help tool...",
    name: "Selactive",
    content: "Lucid helps me understand why I procrastinate on tasks and how to get free from that. Lucid is doing a great job at it. I am very grateful for a tool like Lucid."
  },
  {
    text: "Eye-opening information...",
    name: "Patrick Naughton",
    content: "I am new to this app. I'm not new to my own issues. As I age and now being 62 with years of having needed help. Such little money for eye-opening information in regard to my inner self and drive."
  }
];

// Payment method logos
const PAYMENT_METHODS = [
  { id: 'visa', alt: 'Visa' },
  { id: 'mastercard', alt: 'Mastercard' },
  { id: 'amex', alt: 'American Express' },
  { id: 'paypal', alt: 'PayPal' },
  { id: 'applepay', alt: 'Apple Pay' },
];

// Define PaymentIntent interface
interface PaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { visitorId } = useQuiz();
  const { track } = usePostHog();
  const [selectedPlan, setSelectedPlan] = useState('1month');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // New state for embedded checkout
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Countdown timer state
  const [countdown, setCountdown] = useState({ minutes: 10, seconds: 0 });
  
  // Allow scrolling on the checkout page since it has a lot of content
  useMobileScrollLock({ allowScroll: true });

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
    
    // Track checkout page view
    track('checkout_page_viewed', {
      visitor_id: visitorId,
      user_id: storedUserId || undefined,
      user_email: storedEmail || undefined
    });
  }, [visitorId, track]);
  
  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prevState => {
        if (prevState.seconds > 0) {
          return { ...prevState, seconds: prevState.seconds - 1 };
        } else if (prevState.minutes > 0) {
          return { minutes: prevState.minutes - 1, seconds: 59 };
        } else {
          clearInterval(timer);
          return { minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getPlanDetails = () => {
    const plan = STRIPE_PRODUCTS[selectedPlan];
    if (!plan) return STRIPE_PRODUCTS['1month']; // Default to 1-month
    return plan;
  };

  // Track when user selects a plan
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    
    const plan = STRIPE_PRODUCTS[planId];
    track('plan_selected', {
      visitor_id: visitorId,
      user_id: userId || undefined,
      plan_id: planId,
      plan_name: plan.name,
      plan_price: plan.totalPrice
    });
  };

  const handleGetPlan = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const plan = getPlanDetails();
      
      // Track checkout initiated
      track('checkout_initiated', {
        visitor_id: visitorId,
        user_id: userId || undefined,
        user_email: userEmail || undefined,
        plan_id: selectedPlan,
        plan_name: plan.name,
        plan_price: plan.totalPrice
      });
      
      // Create a payment intent instead of checkout session
      const { clientSecret } = await createStripePaymentIntent(
        plan.priceId,
        userId,
        userEmail || 'temp@example.com', // Provide a fallback temporary email if not available
        selectedPlan
      );
      
      // Set the client secret and open the checkout
      setClientSecret(clientSecret);
      setIsCheckoutOpen(true);
      setIsProcessing(false);
      
      // Track embed checkout opened
      track('embedded_checkout_opened', {
        visitor_id: visitorId,
        user_id: userId || undefined,
        plan_id: selectedPlan
      });
      
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsProcessing(false);
      
      // Track checkout error
      track('checkout_error', {
        visitor_id: visitorId,
        error_type: 'payment_intent_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        plan_id: selectedPlan
      });
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentIntent: PaymentIntent) => {
    track('payment_successful', {
      visitor_id: visitorId,
      user_id: userId || undefined,
      plan_id: selectedPlan,
      payment_intent_id: paymentIntent.id
    });
    
    navigate('/checkout/success');
  };

  // Handle cancellation
  const handleCancel = () => {
    setIsCheckoutOpen(false);
    setClientSecret(null);
    
    track('checkout_canceled', {
      visitor_id: visitorId,
      user_id: userId || undefined,
      plan_id: selectedPlan
    });
  };

  return (
    <div className="min-h-screen bg-lucid-cream flex flex-col">
      {/* Fixed header */}
      <div className="sticky top-0 z-10 w-full bg-white shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <img src="/assets/lucid-icon.svg" alt="Lucid Logo" className="w-full h-full" />
            </div>
            <span className="text-lucid-dark font-medium">Lucid</span>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-sm">
              <span className="text-lucid-gray">Discount is reserved for:</span> 
              <span className="ml-2 text-lucid-pink font-semibold text-lg">
                {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
            {!isCheckoutOpen && (
              <button
                className="bg-lucid-dark text-lucid-cream px-6 py-2 rounded-full font-medium"
                onClick={handleGetPlan}
                disabled={isProcessing}
              >
                {isProcessing ? 'PROCESSING...' : 'GET MY PLAN'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch pb-16">
        <div className="max-w-md mx-auto bg-white">
          {/* Before/After Section */}
          <div className="flex mb-2 bg-lucid-cream">
            <div className="flex-1 p-4 border-r border-lucid-lightGray">
              <div className="text-center mb-2">
                <div className="bg-lucid-cream rounded-full inline-block px-4 py-1 text-lucid-dark font-dm-sans">Now</div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-32 h-32 bg-lucid-cream rounded-full overflow-hidden">
                  <img 
                    src="/assets/figma/before-man-checkout.png" 
                    alt="Current state avatar" 
                    className="absolute top-0 left-0 w-full h-full object-contain" 
                  />
                </div>
              </div>
              <div className="mt-6 space-y-6 font-dm-sans">
                <div>
                  <div className="text-lucid-dark text-base">Energy Level</div>
                  <div className="font-semibold text-lucid-dark">Low</div>
                  <div className="w-full h-2 bg-lucid-lightGray rounded-full mt-2">
                    <div className="w-1/4 h-2 bg-lucid-pink rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="text-lucid-dark text-base">Well-being Level</div>
                  <div className="font-semibold text-lucid-dark">Weak</div>
                  <div className="flex gap-1 mt-2">
                    <div className="flex-1 h-2 bg-lucid-pink rounded-full"></div>
                    <div className="flex-1 h-2 bg-lucid-lightGray rounded-full"></div>
                    <div className="flex-1 h-2 bg-lucid-lightGray rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="text-lucid-dark text-base">Self Esteem Level</div>
                  <div className="font-semibold text-lucid-dark">Low</div>
                  <div className="w-full h-2 bg-lucid-lightGray rounded-full mt-2 relative">
                    <div className="w-1/5 h-2 bg-lucid-pink rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="text-center mb-2">
                <div className="bg-lucid-pink text-white rounded-full inline-block px-4 py-1 font-dm-sans">Goal</div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-32 h-32 bg-lucid-cream rounded-full overflow-hidden">
                  <img 
                    src="/assets/figma/after-man-checkoout.png" 
                    alt="Goal state avatar" 
                    className="absolute top-0 left-0 w-full h-full object-contain" 
                  />
                </div>
              </div>
              <div className="mt-6 space-y-6 font-dm-sans">
                <div>
                  <div className="text-lucid-dark text-base">Energy Level</div>
                  <div className="font-semibold text-lucid-dark">High</div>
                  <div className="w-full h-2 bg-lucid-lightGray rounded-full mt-2">
                    <div className="w-full h-2 bg-lucid-pink rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="text-lucid-dark text-base">Well-being Level</div>
                  <div className="font-semibold text-lucid-dark">Strong</div>
                  <div className="flex gap-1 mt-2">
                    <div className="flex-1 h-2 bg-lucid-pink rounded-full"></div>
                    <div className="flex-1 h-2 bg-lucid-pink rounded-full"></div>
                    <div className="flex-1 h-2 bg-lucid-pink rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="text-lucid-dark text-base">Self Esteem Level</div>
                  <div className="font-semibold text-lucid-dark">High</div>
                  <div className="w-full h-2 bg-lucid-lightGray rounded-full mt-2 relative">
                    <div className="w-full h-2 bg-lucid-pink rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Your personalized plan is ready */}
          <div className="px-6 py-4 text-center bg-white">
            <h2 className="text-2xl font-semibold text-lucid-dark font-dm-sans">Your personalized plan is ready!</h2>
            <div className="flex justify-center mt-4 gap-6">
              <div className="flex items-center">
                <div className="mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#BC5867" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12" stroke="#BC5867" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="8" r="1" fill="#BC5867"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-lucid-gray">Main difficulty</div>
                  <div className="font-semibold text-lucid-dark">{DIFFICULTY}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#BC5867" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-lucid-gray">Goal</div>
                  <div className="font-semibold text-lucid-dark">{GOAL}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans Section */}
          <div className="px-6 py-6 bg-lucid-cream border-t border-lucid-lightGray">
            {isCheckoutOpen && clientSecret ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-lucid-dark">Complete your purchase</h3>
                <EmbeddedCheckout 
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => {
                    setIsCheckoutOpen(false);
                    setClientSecret(null);
                    
                    track('checkout_canceled', {
                      visitor_id: visitorId,
                      user_id: userId || undefined,
                      plan_id: selectedPlan
                    });
                  }}
                />
                
                {/* Back button */}
                <div className="mt-4 text-center">
                  <button 
                    className="text-lucid-gray text-sm"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setClientSecret(null);
                    }}
                  >
                    ← Back to payment options
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {SUBSCRIPTION_PLANS.map((plan, index) => (
                    <div 
                      key={index}
                      className={`border rounded-lg p-4 transition-all cursor-pointer relative ${
                        selectedPlan === plan.id 
                          ? 'border-2 border-lucid-pink bg-lucid-cream' 
                          : 'border-lucid-lightGray hover:border-lucid-gray bg-white'
                      }`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 left-0 right-0 -mt-3 flex justify-center">
                          <div className="bg-lucid-pink text-white text-xs px-3 py-1 rounded-full">
                            MOST POPULAR
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <div className="mr-2 w-5 h-5 flex items-center justify-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                selectedPlan === plan.id ? 'border-lucid-pink' : 'border-lucid-lightGray'
                              }`}>
                                {selectedPlan === plan.id && (
                                  <div className="w-3 h-3 rounded-full bg-lucid-pink"></div>
                                )}
                              </div>
                            </div>
                            <div className="font-semibold text-lucid-dark">{plan.name}</div>
                          </div>
                          <div className="ml-7 text-sm text-lucid-gray">${plan.perDayPrice.toFixed(2)} per day</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-lucid-gray line-through">${plan.originalPrice.toFixed(2)}</div>
                          <div className="text-xl font-bold text-lucid-dark">${plan.discountedPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-xs text-lucid-gray px-4">
                  By clicking "Get My Plan", you agree to a 1-week trial at $10.50, converting to a $43.50/month auto-renewing subscription if not canceled. Cancel via the app or email: support@thelucid.com. See <a href="#" className="text-lucid-pink underline">Subscription Policy</a> for details.
                </div>
                
                <button
                  className="w-full mt-6 bg-lucid-dark text-lucid-cream py-4 rounded-lg font-semibold text-lg"
                  onClick={handleGetPlan}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'PROCESSING...' : 'PURCHASE MY PLAN'}
                </button>
                
                <div className="mt-3">
                  <PaymentRequestButton
                    amount={SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)?.discountedPrice || 19.99}
                    planName={SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)?.name || '1-MONTH PLAN'}
                    onSuccess={(paymentIntent) => {
                      track('express_payment_successful', {
                        visitor_id: visitorId,
                        user_id: userId || undefined,
                        plan_id: selectedPlan,
                        payment_intent_id: paymentIntent.id,
                        method: 'express_checkout'
                      });
                      
                      navigate('/checkout/success');
                    }}
                    onError={(error) => {
                      console.error('Express payment error:', error);
                      toast({
                        title: "Payment Failed",
                        description: error.message || "There was an error processing your payment. Please try again.",
                        variant: "destructive",
                        duration: 5000,
                      });
                      
                      track('checkout_error', {
                        visitor_id: visitorId,
                        error_type: 'express_payment_error',
                        error_message: error.message || 'Unknown error',
                        plan_id: selectedPlan
                      });
                    }}
                  />
                </div>
                
                <div className="mt-2 text-center">
                  <button 
                    className="text-lucid-pink text-sm font-medium"
                    onClick={() => {
                      setIsCheckoutOpen(true);
                      handleGetPlan();
                    }}
                  >
                    More payment options
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center text-lucid-gray text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-lucid-pink">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Pay Safe & Secure
                  </div>
                </div>

                <div className="flex justify-center gap-3 mt-2 mb-8">
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="w-10 h-6 opacity-70">
                      <div className="w-full h-full bg-lucid-lightGray rounded-sm flex items-center justify-center text-[8px] text-lucid-gray">
                        {method.alt}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Featured In Section */}
          <div className="p-8 mt-4 text-center bg-lucid-cream border-t border-lucid-lightGray">
            <div className="text-xl text-lucid-gray mb-6">AS FEATURED IN</div>
            <div className="flex flex-wrap justify-center gap-8">
              {FEATURED_LOGOS.map((logo, index) => (
                <div key={index} className="text-lucid-gray font-serif text-lg">{logo}</div>
              ))}
            </div>
          </div>
          
          {/* People like you achieved results */}
          <div className="p-6 mt-4 bg-lucid-cream text-center border-t border-lucid-lightGray">
            <h2 className="text-2xl font-semibold text-lucid-dark">People just like you achieved great results using our</h2>
            <p className="text-2xl font-semibold text-lucid-pink mt-1 mb-8">Well-being Management Plan!</p>
            
            <div className="mt-12 relative">
              <div className="w-48 h-48 mx-auto bg-lucid-pink bg-opacity-10 rounded-full flex items-center justify-center">
                <div className="text-4xl font-bold text-lucid-pink">83%</div>
              </div>
              <div className="absolute top-0 left-1/4 -ml-8 bg-lucid-pink bg-opacity-10 px-3 py-1 rounded-full">
                <span className="text-lucid-pink font-semibold">77%</span>
              </div>
              <div className="absolute bottom-8 right-1/4 bg-lucid-pink bg-opacity-10 px-3 py-1 rounded-full">
                <span className="text-lucid-pink font-semibold">45%</span>
              </div>
            </div>
            
            <div className="mt-12 space-y-6">
              {STATS.map((stat, index) => (
                <div key={index} className="font-medium">
                  <span className="text-lucid-pink text-xl font-bold">{stat.percent}</span> <span className="text-lucid-dark">{stat.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* How life might be without Lucid */}
          <div className="p-6 mt-4 bg-lucid-cream border-t border-lucid-lightGray">
            <h3 className="text-xl font-semibold mb-6 text-lucid-dark">How life might be without Lucid</h3>
            <ul className="space-y-4">
              {LIFE_WITHOUT.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-lucid-lightGray p-1 rounded-full mr-3 mt-1 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="#BC5867" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-lucid-dark">{item}</div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* What Lucid can help with */}
          <div className="p-6 mt-4 bg-white border border-lucid-lightGray rounded-lg mx-4 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-lucid-dark">What Lucid can help you with</h3>
            <ul className="space-y-4">
              {CAN_HELP_WITH.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-lucid-lightGray p-1 rounded-full mr-3 mt-1 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="#BC5867" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-lucid-dark">{item}</div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Awards Section */}
          <div className="p-6 mt-6 bg-lucid-cream flex items-center mx-4 rounded-lg shadow-sm">
            <div className="mr-4">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                <circle cx="32" cy="32" r="30" fill="#BC5867" stroke="white" strokeWidth="4" strokeDasharray="4 4"/>
                <path d="M40.7071 26.2929C41.0976 26.6834 41.0976 27.3166 40.7071 27.7071L30.7071 37.7071C30.3166 38.0976 29.6834 38.0976 29.2929 37.7071L23.2929 31.7071C22.9024 31.3166 22.9024 30.6834 23.2929 30.2929C23.6834 29.9024 24.3166 29.9024 24.7071 30.2929L30 35.5858L39.2929 26.2929C39.6834 25.9024 40.3166 25.9024 40.7071 26.2929Z" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-lucid-dark">Lucid is proudly nominated for an</p>
              <p className="text-lucid-pink font-semibold">International Digital Well-being Innovation Award - 2023.</p>
            </div>
          </div>
          
          {/* Testimonials */}
          <div className="p-6 mt-6 bg-lucid-cream border-t border-lucid-lightGray">
            <h3 className="text-xl font-semibold mb-4 text-center text-lucid-dark">Users love our plans</h3>
            <p className="text-center text-lucid-gray mb-8">Here's what people are saying about Lucid</p>
            
            <div className="space-y-6">
              {TESTIMONIALS.map((testimonial, index) => (
                <div key={index} className="border border-lucid-lightGray rounded-lg p-5 shadow-sm bg-white">
                  <div className="flex items-center mb-3">
                    <div className="text-[#FFD700] text-lg">★★★★★</div>
                  </div>
                  <h4 className="font-semibold mb-3 text-lg text-lucid-dark">{testimonial.text}</h4>
                  <p className="text-lucid-gray mb-3">{testimonial.content}</p>
                  <div className="text-right text-sm font-medium text-lucid-dark">{testimonial.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* People often ask */}
          <div className="p-6 mt-6 bg-lucid-cream border-t border-lucid-lightGray">
            <h3 className="text-xl font-semibold mb-8 text-center text-lucid-dark">People often ask</h3>
            <div className="space-y-8">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index}>
                  <h4 className="flex items-start mb-3">
                    <span className="bg-lucid-lightGray p-1 rounded-full mr-3 flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#BC5867" strokeWidth="2" />
                        <path d="M12 16V12" stroke="#BC5867" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="8" r="1" fill="#BC5867" />
                      </svg>
                    </span>
                    <span className="font-semibold text-lucid-dark">{item.question}</span>
                  </h4>
                  <p className="ml-8 text-lucid-gray">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* 30-Day Money-Back Guarantee */}
          <div className="p-6 mt-8 border-2 border-lucid-pink rounded-lg mx-4 relative shadow-md bg-white">
            <h3 className="text-xl font-bold mb-4 text-center text-lucid-dark">30-Day Money-Back Guarantee</h3>
            <p className="text-center mb-4 text-lucid-gray">
              Our plan is backed by a money-back guarantee. We believe that our plan will work for you, that we guarantee a full refund within 30 days after purchase if you don't see visible results in your ability to reduce negative effects despite following your plan as directed. Find more about applicable limitations in our money-back policy
            </p>
            <div className="text-center">
              <a href="#" className="text-lucid-pink font-medium underline">Learn more.</a>
            </div>
            <div className="absolute -bottom-6 -right-2">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
                <circle cx="40" cy="40" r="38" fill="#BC5867" stroke="white" strokeWidth="4" strokeDasharray="4 4"/>
                <path d="M50.7071 32.2929C51.0976 32.6834 51.0976 33.3166 50.7071 33.7071L38.7071 45.7071C38.3166 46.0976 37.6834 46.0976 37.2929 45.7071L29.2929 37.7071C28.9024 37.3166 28.9024 36.6834 29.2929 36.2929C29.6834 35.9024 30.3166 35.9024 30.7071 36.2929L38 43.5858L49.2929 32.2929C49.6834 31.9024 50.3166 31.9024 50.7071 32.2929Z" fill="white"/>
              </svg>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="p-6 mt-16 bg-lucid-cream">
            <button 
              onClick={handleGetPlan} 
              className="w-full bg-lucid-dark text-lucid-cream py-4 rounded-lg font-bold text-lg shadow-md hover:bg-lucid-dark/90 transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? 'PROCESSING...' : 'PURCHASE MY PLAN'}
            </button>
            
            <div className="mt-4 text-sm text-lucid-gray text-center">
              30-day money-back guarantee if you are not satisfied
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 text-center text-xs text-lucid-gray border-t border-lucid-lightGray mt-6">
            LUCID LLC., 7455 Arroyo Crossing Pkwy Suite 220 Las Vegas, NV 89113
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 