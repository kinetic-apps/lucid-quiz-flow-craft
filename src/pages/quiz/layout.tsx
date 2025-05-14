import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { QuizProvider } from '@/context/QuizContext';
import ProgressBar from '@/components/quiz/ProgressBar';

const ProgressBarWrapper = () => {
  const [showProgressBar, setShowProgressBar] = useState(true);
  
  // Check if we're on the "Did You Know" slide using localStorage
  useEffect(() => {
    const checkProgressBarState = () => {
      const isDidYouKnowSlide = localStorage.getItem('showing_did_you_know') === 'true';
      const hasStartedQuiz = localStorage.getItem('quiz_started') === 'true';
      
      // Hide progress bar on Did You Know slide, show it if quiz has started
      if (isDidYouKnowSlide) {
        setShowProgressBar(false);
      } else if (hasStartedQuiz) {
        setShowProgressBar(true);
      }
    };
    
    // Initial check
    checkProgressBarState();
    
    // Listen for storage changes to update in real-time
    window.addEventListener('storage', checkProgressBarState);
    
    return () => {
      window.removeEventListener('storage', checkProgressBarState);
    };
  }, []);
  
  if (!showProgressBar) {
    // Return a placeholder div to maintain layout but without the progress bar
    return (
      <header className="p-4">
        <div className="flex justify-center items-center relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <img src="/assets/lucid-icon.svg" alt="Lucid Logo" className="w-full h-full" />
            </div>
            <span className="text-lucid-dark font-medium">lucid</span>
          </div>
        </div>
      </header>
    );
  }
  
  return <ProgressBar />;
};

export default function QuizLayout() {
  return (
    <QuizProvider>
      <div className="min-h-screen flex flex-col bg-lucid-cream">
        <ProgressBarWrapper />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-md mx-auto py-4 px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </QuizProvider>
  );
}
