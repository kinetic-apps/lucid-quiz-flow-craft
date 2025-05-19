import React, { useState, useEffect, useRef, useMemo, memo, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { supabase } from '@/lib/supabase';
import { Elements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

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

// Stable wrapper for Express Checkout Elements
const ExpressCheckoutWrapper = memo(function ExpressCheckoutWrapper({
  clientSecret,
  amount,
  planName,
  email,
  onSuccess,
  onError
}: {
  clientSecret: string;
  amount: number;
  planName: string;
  email: string | null;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: Error) => void;
}) {
  // Create stable elements options
  const elementsOptions = useMemo(() => {
    return {
      clientSecret,
      appearance: { 
        theme: 'stripe',
        variables: {
          colorPrimary: '#BC5867',
          colorBackground: '#FFFFFF',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSizeBase: '16px',
          borderRadius: '4px',
        }
      },
      loader: 'auto'
    } as StripeElementsOptions;
  }, [clientSecret]);

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentRequestButton
        amount={amount}
        planName={planName}
        email={email}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
});

// Fix the error boundary component with proper TypeScript interface definitions
interface StripeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface StripeErrorBoundaryProps {
  children: ReactNode;
}

class StripeErrorBoundary extends React.Component<StripeErrorBoundaryProps, StripeErrorBoundaryState> {
  constructor(props: StripeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): StripeErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Stripe component error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-500 font-medium">Payment options unavailable</p>
          <p className="text-sm text-gray-600 mt-2">Please try refreshing the page or use the card payment option below.</p>
        </div>
      );
    }

    return this.props.children;
  }
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
  
  // State for the main embedded checkout (PaymentElement)
  const [embeddedClientSecret, setEmbeddedClientSecret] = useState<string | null>(null);
  const [isEmbeddedCheckoutOpen, setIsEmbeddedCheckoutOpen] = useState(false);

  // New state for Express Checkout Element client secret
  const [expressClientSecret, setExpressClientSecret] = useState<string | null>(null);
  const [expressCheckoutError, setExpressCheckoutError] = useState<string | null>(null);
  const [isFetchingExpressClientSecret, setIsFetchingExpressClientSecret] = useState(false);
  const expressClientSecretFetchedRef = useRef(false);
  const lastFetchedPlanIdRef = useRef<string | null>(null);
  const lastFetchedUserEmailRef = useRef<string | null>(null);

  // New refs to prevent looping on persistent failure for the exact same parameters
  const lastAttemptPlanIdRef = useRef<string | null>(null);
  const lastAttemptEmailRef = useRef<string | null>(null);
  const attemptCompletedForCurrentParamsRef = useRef(false);
  
  // Countdown timer state
  const [countdown, setCountdown] = useState({ minutes: 10, seconds: 0 });
  
  // Allow scrolling on the checkout page since it has a lot of content
  useMobileScrollLock({ allowScroll: true });

  // Determine gender and set image paths
  const storedGender = typeof window !== 'undefined' ? localStorage.getItem('lucid_gender') : null;
  const isFemale = storedGender === 'female';

  const beforeImageSrc = isFemale ? '/images/female-sad.png' : '/assets/figma/before-man-checkout.png';
  const afterImageSrc = isFemale ? '/images/female-happy-after.png' : '/assets/figma/after-man-checkoout.png'; // Note current typo 'checkoout' for male after image

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

  // Improve the client secret fetch effect to prevent memory leaks and infinite retries
  useEffect(() => {
    const planDetails = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

    if (!planDetails) {
      setExpressClientSecret(null);
      setExpressCheckoutError(null);
      attemptCompletedForCurrentParamsRef.current = false; 
      lastAttemptPlanIdRef.current = null; 
      lastAttemptEmailRef.current = null;
      expressClientSecretFetchedRef.current = false;
      lastFetchedPlanIdRef.current = null;
      lastFetchedUserEmailRef.current = null;
      return;
    }

    // Check browser support for Apple Pay / Google Pay
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const potentiallySupportsApplePay = isMobileDevice && isSafari;
    
    // If plan or email has changed from the last ATTEMPT, we need a new attempt.
    if (selectedPlan !== lastAttemptPlanIdRef.current || userEmail !== lastAttemptEmailRef.current) {
      attemptCompletedForCurrentParamsRef.current = false;
      setExpressClientSecret(null);
      setExpressCheckoutError(null);
      expressClientSecretFetchedRef.current = false;
    }

    // Return early if we're already fetching or we've already completed an attempt
    if (attemptCompletedForCurrentParamsRef.current || isFetchingExpressClientSecret) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchExpressClientSecret = async () => {
      if (!isMounted) return;
      
      setIsFetchingExpressClientSecret(true);
      setExpressCheckoutError(null);

      const attemptPlanId = selectedPlan;
      const attemptUserEmail = userEmail;

      // Update last attempted refs *before* the async call
      lastAttemptPlanIdRef.current = attemptPlanId;
      lastAttemptEmailRef.current = attemptUserEmail;

      // Define the URL and request data outside the try block
      const url = 'https://bsqmlzocdhummisrouzs.supabase.co/functions/v1/create-payment-intent-express';
      const requestData = {
        amount: Math.round(planDetails.discountedPrice * 100),
        email: attemptUserEmail,
      };

      try {
        console.log(`Fetching payment intent for plan: ${attemptPlanId}, amount: ${requestData.amount}`);
        
        // Add a slight delay to ensure UI reflects loading state
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Mobile-Device': isMobileDevice ? 'true' : 'false',
            'X-Supports-Apple-Pay': potentiallySupportsApplePay ? 'true' : 'false'
          },
          body: JSON.stringify(requestData),
          mode: 'cors',
          credentials: 'omit',
          signal, // Add AbortController signal
        });

        if (!isMounted) return;

        if (!response.ok) {
          let errorMessage = 'Network response was not ok for express client secret.';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (jsonError) {
            console.error('Error parsing error response:', jsonError);
            // If we can't parse JSON, use the status text
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Payment intent created successfully');
        
        if (!isMounted) return;
        
        if (!data.clientSecret) {
          throw new Error('Response did not contain a client secret');
        }
        
        setExpressClientSecret(data.clientSecret);
        expressClientSecretFetchedRef.current = true;
        lastFetchedPlanIdRef.current = attemptPlanId;
        lastFetchedUserEmailRef.current = attemptUserEmail;
        attemptCompletedForCurrentParamsRef.current = true;
      } catch (error) {
        if (!isMounted) return;
        
        // Don't log aborted requests as errors
        if (error.name === 'AbortError') return;
        
        console.error("Failed to fetch clientSecret for Express Checkout:", error);
        
        let errorMessage = 'Failed to initialize express payment options.';
        
        // Network errors and CORS issues often have specific error types
        if (error instanceof TypeError) {
          if (error.message.includes('failed') || error.message.includes('network')) {
            errorMessage = 'Network connection issue. Please check your internet connection and try again.';
          } else if (error.message.includes('CORS') || error.message.includes('access control')) {
            errorMessage = 'Cross-origin request blocked. This appears to be a temporary issue with our payment processor.';
          }
        }
        
        const message = error instanceof Error ? (error.message || errorMessage) : errorMessage;
        setExpressCheckoutError(message);
        setExpressClientSecret(null);
        attemptCompletedForCurrentParamsRef.current = true;
        expressClientSecretFetchedRef.current = false;
      } finally {
        if (isMounted) {
          setIsFetchingExpressClientSecret(false);
        }
      }
    };

    // Add a retry mechanism for network errors
    let retryCount = 0;
    const maxRetries = 2;
    const retryDelay = 1500; // 1.5 seconds
    
    const attemptFetchWithRetry = async () => {
      try {
        await fetchExpressClientSecret();
      } catch (error) {
        if (retryCount < maxRetries && isMounted && 
            error instanceof Error && 
            (error.message.includes('network') || error.message.includes('failed'))) {
          retryCount++;
          console.log(`Retrying fetch attempt ${retryCount} of ${maxRetries}...`);
          setTimeout(attemptFetchWithRetry, retryDelay);
        }
      }
    };
    
    attemptFetchWithRetry();

    // Clean up function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedPlan, userEmail]);

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

      // Get Supabase user details for Stripe
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      const supabaseUserId = supabaseUser?.id;
      const supabaseUserEmail = supabaseUser?.email;
      // Assuming user_metadata might contain a name, adjust key if different
      const supabaseUserFullName = supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name;

      let emailForStripe: string;
      let nameForStripe: string | undefined;

      if (supabaseUserEmail) {
        emailForStripe = supabaseUserEmail;
      } else if (supabaseUserId) {
        emailForStripe = `${supabaseUserId}@placeholder.dev`;
      } else {
        // Fallback if somehow no supabaseUserId (should not happen with current PostHogContext setup)
        // Consider if a more robust error handling or default is needed here.
        emailForStripe = `anonymous-${Date.now()}@placeholder.dev`; 
      }

      if (supabaseUserFullName) {
        nameForStripe = supabaseUserFullName;
      } else if (supabaseUserId) {
        nameForStripe = `User ${supabaseUserId.substring(0, 8)}`;
      } // If no name and no supabaseUserId, nameForStripe remains undefined
      
      // Track checkout initiated
      track('checkout_initiated', {
        visitor_id: visitorId,
        user_id: supabaseUserId || undefined,
        user_email: emailForStripe || undefined,
        plan_id: selectedPlan,
        plan_name: plan.name,
        plan_price: plan.totalPrice
      });
      
      // Create a payment intent instead of checkout session
      const { clientSecret: newEmbeddedClientSecret, customerId } = await createStripePaymentIntent(
        plan.priceId,
        supabaseUserId || null, 
        emailForStripe,      
        selectedPlan,
        nameForStripe || null 
      );
      
      // Set the client secret and open the checkout
      setEmbeddedClientSecret(newEmbeddedClientSecret);
      setIsEmbeddedCheckoutOpen(true);
      setIsProcessing(false);
      
      // Track embed checkout opened
      track('embedded_checkout_opened', {
        visitor_id: visitorId,
        user_id: supabaseUserId || undefined,
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
    
    navigate('/checkout/refund-notification');
  };

  // Handle cancellation
  const handleCancel = () => {
    setIsEmbeddedCheckoutOpen(false);
    setEmbeddedClientSecret(null);
    
    track('checkout_canceled', {
      visitor_id: visitorId,
      user_id: userId || undefined,
      plan_id: selectedPlan
    });
  };

  // Define options for the Elements provider for Express Checkout
  const expressElementsOptions: StripeElementsOptions | undefined = useMemo(() => {
    if (!expressClientSecret) return undefined;
    return {
      clientSecret: expressClientSecret,
      appearance: { theme: 'stripe' },
    } as StripeElementsOptions;
  }, [expressClientSecret]);

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
            {!isEmbeddedCheckoutOpen && (
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
                <div className="bg-lucid-cream rounded-full inline-block px-4 py-1 text-lucid-dark">Now</div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-32 h-32 bg-lucid-cream rounded-full overflow-hidden">
                  <img 
                    src={beforeImageSrc}
                    alt="Current state avatar" 
                    className="absolute top-0 left-0 w-full h-full object-contain" 
                  />
                </div>
              </div>
              <div className="mt-6 space-y-6">
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
                <div className="bg-lucid-pink text-white rounded-full inline-block px-4 py-1">Goal</div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-32 h-32 bg-lucid-cream rounded-full overflow-hidden">
                  <img 
                    src={afterImageSrc}
                    alt="Goal state avatar" 
                    className="absolute top-0 left-0 w-full h-full object-contain" 
                  />
                </div>
              </div>
              <div className="mt-6 space-y-6">
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
            <h2 className="text-2xl font-semibold text-lucid-dark">Your personalized plan is ready!</h2>
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

          {/* Subscription Plans Section & Payment Buttons */}
          <div className="px-6 py-6 bg-lucid-cream border-t border-lucid-lightGray">
            {isEmbeddedCheckoutOpen && embeddedClientSecret ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-lucid-dark">Complete your purchase</h3>
                {/* Elements provider for Embedded Checkout */}
                <Elements stripe={stripePromise} options={{ clientSecret: embeddedClientSecret, appearance: {theme: 'stripe'} }}>
                  <EmbeddedCheckout 
                    clientSecret={embeddedClientSecret} // Prop might be redundant if Elements takes it
                    onSuccess={handlePaymentSuccess}
                    onCancel={handleCancel} // Renamed for clarity
                  />
                </Elements>
                
                {/* Back button */}
                <div className="mt-4 text-center">
                  <button 
                    className="text-lucid-gray text-sm"
                    onClick={handleCancel}
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
                  onClick={handleGetPlan} // This triggers Embedded Checkout flow
                  disabled={isProcessing}
                >
                  {isProcessing ? 'PROCESSING...' : 'PURCHASE MY PLAN'}
                </button>
                
                {/* Express Checkout Section */}
                <div className="mt-3">
                  {isFetchingExpressClientSecret && (
                    <div className="text-center py-2 relative z-10">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-lucid-pink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading payment options...
                      </div>
                    </div>
                  )}
                  {expressCheckoutError && <div className="text-red-500 text-sm text-center py-2">Error: {expressCheckoutError}</div>}
                  
                  {expressElementsOptions ? (
                    <StripeErrorBoundary>
                      <ExpressCheckoutWrapper
                        clientSecret={expressClientSecret!}
                        amount={SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)?.discountedPrice || 0}
                        planName={SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)?.name || 'Selected Plan'}
                        email={userEmail}
                        onSuccess={(paymentIntent) => {
                          track('express_payment_successful', {
                            visitor_id: visitorId,
                            user_id: userId || undefined,
                            plan_id: selectedPlan,
                            payment_intent_id: paymentIntent.id,
                            method: 'express_checkout'
                          });
                          navigate('/checkout/refund-notification');
                        }}
                        onError={(error) => {
                          console.error('Express payment error on page:', error);
                          toast({
                            title: "Payment Failed",
                            description: error.message || "There was an error processing your payment via express options. Please try again.",
                            variant: "destructive",
                            duration: 5000,
                          });
                          setExpressCheckoutError(error.message);
                          track('checkout_error', {
                            visitor_id: visitorId,
                            error_type: 'express_payment_error',
                            error_message: error.message || 'Unknown error',
                            plan_id: selectedPlan
                          });
                        }}
                      />
                    </StripeErrorBoundary>
                  ) : (
                    !expressCheckoutError && !isFetchingExpressClientSecret && <div className="text-center py-2 text-sm text-gray-500">Select a plan to see express payment options.</div>
                  )}
                </div>
                
                <div className="mt-2 text-center">
                  <button 
                    className="text-lucid-pink text-sm font-medium"
                    onClick={() => {
                      // This button now explicitly opens the Embedded Checkout by calling handleGetPlan
                      // which fetches client secret for EmbeddedCheckout and sets isEmbeddedCheckoutOpen
                      handleGetPlan(); 
                    }}
                    disabled={isProcessing} // Disable if already processing embedded checkout PI creation
                  >
                    More payment options (Card, etc.)
                  </button>
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