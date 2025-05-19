import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

// Client-side representation of STRIPE_PRODUCTS for price lookup
// Ideally, this would be fetched or managed in a shared config
const STRIPE_PRODUCTS_CLIENT = {
  'price_1RQVEuLFUMi6CEqxBMskP9TG': { // 7day
    totalPrice: 2.99,
  },
  'price_1RQVCkLFUMi6CEqx1EYMZu0I': { // 1month
    totalPrice: 8.99,
  },
  'price_1RQVEPLFUMi6CEqxdE5xNYtT': { // 3month
    totalPrice: 19.99,
  }
};

// More specific types for fbq arguments if needed, or use a simpler one
interface FbqPurchaseParams {
  value: number;
  currency: string;
  [key: string]: any; // Allow other standard or custom parameters
}

declare global {
  interface Window {
    fbq?: (
      action: 'track' | 'init' | string, // Allow standard actions and others
      eventNameOrPixelId: 'Purchase' | 'PageView' | string, // For 'track' or pixel ID for 'init'
      params?: FbqPurchaseParams | Record<string, unknown> // Params for 'Purchase' or other events
    ) => void;
  }
}

const RefundNotificationPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const priceId = queryParams.get('priceId');

    let purchaseValue = 0.00; // Default value
    const currency = 'USD'; // Currency is fixed to USD as per backend

    if (priceId && STRIPE_PRODUCTS_CLIENT[priceId as keyof typeof STRIPE_PRODUCTS_CLIENT]) {
      purchaseValue = STRIPE_PRODUCTS_CLIENT[priceId as keyof typeof STRIPE_PRODUCTS_CLIENT].totalPrice;
    }

    if (window.fbq) {
      // Send Purchase event to Facebook Pixel
      window.fbq('track', 'Purchase', { value: purchaseValue, currency: currency });
    }
  }, [location.search]); // Rerun if query params change

  return (
    <div className="min-h-screen bg-lucid-cream flex flex-col justify-center items-center p-4">
      <div className="bg-lucid-offWhite shadow-xl rounded-lg p-8 md:p-12 max-w-lg w-full text-center">
        <svg
          className="w-16 h-16 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: '#BC5867' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold text-lucid-dark mb-4">
          Transaction Issue & Refund Initiated
        </h1>
        <p className="text-lucid-dark mb-6 text-lg">
          We encountered an issue processing your transaction. 
          Don't worry, a full refund has been automatically initiated.
        </p>
        <p className="text-lucid-dark mb-8 text-lg">
          You should see the refund in your account within 5-10 business days.
        </p>
        <p className="text-lucid-dark mb-8 text-sm">
          We apologize for any inconvenience.
        </p>
        <Link
          to="/" // Assuming '/' is the home page route
          className="w-full text-white py-3 px-6 rounded-lg font-bold text-lg hover:opacity-90 transition duration-150 ease-in-out inline-block"
          style={{ backgroundColor: '#BC5867' }}
        >
          Back to Homepage
        </Link>
      </div>
      <p className="mt-8 text-sm text-lucid-dark">
        If you have any questions, please contact support.
      </p>
    </div>
  );
};

export default RefundNotificationPage; 