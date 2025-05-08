import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { updateUserSubscription } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    // In a real app, you'd retrieve the user ID from the session or localStorage
    // For this demo, we'll simulate it
    const simulatedUserId = localStorage.getItem('user_id') || 'demo-user-id';
    setUserId(simulatedUserId);
  }, []);

  const getPlanDetails = () => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    if (!plan) return SUBSCRIPTION_PLANS[1]; // Default to 1-month
    return plan;
  };

  const handleGetPlan = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // In a real app, this would integrate with a payment provider like Stripe
      // For the demo, we'll simulate a successful payment
      
      const plan = getPlanDetails();
      
      // Generate mock subscription data
      const subscriptionId = `sub_${Math.random().toString(36).substr(2, 9)}`;
      const startDate = new Date().toISOString();
      
      // Calculate end date based on plan
      const endDate = new Date();
      if (plan.id === '7day') {
        endDate.setDate(endDate.getDate() + 7);
      } else if (plan.id === '1month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.id === '3month') {
        endDate.setMonth(endDate.getMonth() + 3);
      }
      
      if (userId) {
        // Update user with subscription details
        await updateUserSubscription(
          userId,
          subscriptionId,
          plan.name,
          startDate,
          endDate.toISOString()
        );
      }
      
      // Show success toast
      toast({
        title: "Subscription Successful!",
        description: `Your ${plan.name} has been activated.`,
        duration: 5000,
      });
      
      // In a real app, you'd redirect to a confirmation page or dashboard
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto bg-[#f9f7f3] pb-8">
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

          {/* Plan Selection */}
          <div className="p-4">
            <h2 className="text-2xl font-bold text-center mb-6">Your personalized plan is ready!</h2>
            
            <div className="flex mb-6">
              <div className="flex items-center mr-6">
                <div className="bg-green-100 p-2 rounded-full mr-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#7c3aed" strokeWidth="2" />
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="#7c3aed" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Main difficulty</div>
                  <div className="font-bold">Perfectionist</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#7c3aed" strokeWidth="2" />
                    <path d="M12 16V8M9 11L12 8L15 11" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Goal</div>
                  <div className="font-bold">Energy levels</div>
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="space-y-4">
              {SUBSCRIPTION_PLANS.map(plan => (
                <div 
                  key={plan.id}
                  className={`border rounded-lg p-4 flex items-center ${plan.popular ? 'border-[#7c3aed]' : 'border-gray-200'} relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <div className="bg-[#7c3aed] text-white text-xs px-4 py-1 rounded-full font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  <input 
                    type="radio"
                    id={plan.id}
                    name="plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id)}
                    className="mr-4"
                  />
                  <label htmlFor={plan.id} className="flex-1">
                    <div className="font-bold">{plan.name}</div>
                    <div className="text-gray-500">${plan.totalPrice.toFixed(2)}</div>
                  </label>
                  <div className="bg-gray-100 p-2 rounded-lg text-center">
                    <div className="text-2xl font-bold">${plan.perDayPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">per day</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              By clicking "Get My Plan", you agree to automatic subscription renewal. 
              First month is $43.50, then $43.50/month. Cancel via the app or 
              email: support@lucid.app. See <a href="/subscription-policy" className="text-[#7c3aed] underline">Subscription Policy</a> for details.
            </div>

            <button 
              onClick={handleGetPlan} 
              className="mt-6 w-full bg-[#7c3aed] text-white py-3 rounded-lg font-bold text-lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESSING...
                </span>
              ) : (
                'GET MY PLAN'
              )}
            </button>

            <div className="mt-4 flex justify-center items-center">
              <svg className="w-5 h-5 text-[#7c3aed] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
              </svg>
              <div className="text-[#7c3aed] font-medium">Pay Safe & Secure</div>
            </div>

            <div className="mt-4 flex justify-center space-x-2">
              {PAYMENT_METHODS.map(method => (
                <div key={method.name} className="w-9 h-6">
                  <img 
                    src={method.image} 
                    alt={method.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
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