import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

const RefundNotificationPage: React.FC = () => {
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