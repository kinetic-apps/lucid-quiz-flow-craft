import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const GenderSelect = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center border-b bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Lucid</h1>
          </div>
          <button className="text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center p-4 pt-10">
        <div className="max-w-xl w-full">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-900">
            A PERSONALIZED ONBOARDING PLAN
          </h1>
          
          <p className="text-xl text-center mb-8 text-gray-800 px-6">
            IMPROVE YOUR PRODUCTIVITY WITH OUR PERSONALIZED PLAN
          </p>
          
          <p className="text-2xl font-medium text-center mb-10 text-gray-900">
            3-MINUTE QUIZ
          </p>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="flex flex-col">
              <div className="rounded-t-lg overflow-hidden mb-0">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="Male" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Link 
                to="/quiz/male" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-b-lg flex items-center justify-between px-8 text-xl"
              >
                <span>Male</span> <ChevronRight className="w-6 h-6" />
              </Link>
            </div>
            
            <div className="flex flex-col">
              <div className="rounded-t-lg overflow-hidden mb-0">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                  alt="Female" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Link 
                to="/quiz/female" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-b-lg flex items-center justify-between px-8 text-xl"
              >
                <span>Female</span> <ChevronRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
          
          <p className="text-base text-gray-600 text-center mt-2">
            By clicking "Male" or "Female" you agree with our{' '}
            <Link to="/terms" className="text-blue-500 hover:underline">Terms of Use and Service</Link>,{' '}
            <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>,{' '}
            <Link to="/subscription" className="text-blue-500 hover:underline">Subscription Policy</Link> and{' '}
            <Link to="/cookie" className="text-blue-500 hover:underline">Cookie Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default GenderSelect; 