import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { QuizProvider } from '@/context/QuizContext';
import ProgressBar from '@/components/quiz/ProgressBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProgressBarWrapper = () => {
  const [showProgressBar, setShowProgressBar] = useState(true);
  const navigate = useNavigate();
  
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
  
  // Handle back navigation for Did You Know and intro slides
  const handleBackNavigation = () => {
    const isOnDidYouKnowSlide = localStorage.getItem('showing_did_you_know') === 'true';
    const quizStarted = localStorage.getItem('quiz_started') === 'true';
    const hasGender = localStorage.getItem('lucid_gender') !== null;
    const hasAgeRange = localStorage.getItem('lucid_age_range') !== null;
    
    // On age selection screen (has gender but no age range yet)
    if (hasGender && !hasAgeRange && !isOnDidYouKnowSlide && !quizStarted) {
      // Go back to gender selection screen
      const event = new CustomEvent('quiz-back-navigation', { detail: { screen: 'age-select' } });
      window.dispatchEvent(event);
      return;
    }
    
    if (isOnDidYouKnowSlide) {
      // On "Did You Know" slide - go back to age selection
      const event = new CustomEvent('quiz-back-navigation', { detail: { screen: 'did-you-know' } });
      window.dispatchEvent(event);
      return;
    }
    
    // For any other case where the progress bar isn't shown (like confirmation)
    if (!showProgressBar && !quizStarted) {
      // On confirmation slide - go back to Did You Know
      const event = new CustomEvent('quiz-back-navigation', { detail: { screen: 'confirmation' } });
      window.dispatchEvent(event);
      return;
    }
    
    // Fallback - navigate to home
    navigate('/');
  };
  
  if (!showProgressBar) {
    // Return a header with the back button but without the progress bar
    return (
      <header className="p-4">
        <div className="flex justify-center items-center relative">
          {/* Add back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackNavigation}
            className="absolute left-0 text-lucid-dark"
          >
            <ArrowLeft size={24} />
          </Button>
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
