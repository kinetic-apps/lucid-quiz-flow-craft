import React from 'react';
import { Link } from 'react-router-dom';

const MindfulnessQuiz = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center mb-4">
              Discover Your Perfect{' '}
              <span className="text-lucid-violet-600">Mindfulness</span>{' '}
              Practice
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              Take our personalized quiz and discover the perfect mindfulness techniques tailored specifically to your lifestyle, preferences, and goals.
            </p>
            
            <div className="flex justify-center mb-2">
              <Link to="/gender-select">
                <button className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white px-8 py-3 rounded-lg font-medium">
                  Start Your Free Quiz
                </button>
              </Link>
            </div>
            
            <p className="text-xs text-gray-500 text-center mb-6">
              Takes only 2 minutes • No sign-up required
            </p>
            
            <div className="bg-gray-100 aspect-video rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MindfulnessQuiz; 