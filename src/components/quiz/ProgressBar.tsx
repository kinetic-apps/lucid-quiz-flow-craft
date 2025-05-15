import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Step } from '@/context/QuizContext';

// Function to determine if a step should display the progress bar
const isQuestionStep = (currentStep: number, allSteps: Step[]): boolean => {
  if (!allSteps || allSteps.length === 0) return true;
  
  // If we can access the step data, check if it's a 'question' type
  const currentStepData = allSteps[currentStep];
  return currentStepData?.type === 'question';
};

const ProgressBar = () => {
  const { currentStep, totalSteps, goToPrevStep, allSteps, userAgeRange } = useQuiz();
  const progressPercentage = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  const navigate = useNavigate();
  const [showProgressBar, setShowProgressBar] = useState(false);
  
  // Determine if we should show the progress bar based on quiz state
  useEffect(() => {
    // Check if we're on the "Did You Know" slide
    const isOnDidYouKnowSlide = localStorage.getItem('showing_did_you_know') === 'true';
    
    // Only show progress bar if:
    // 1. We have an age range selected (meaning we've passed the age selection step)
    // 2. And we're not on the "Did You Know" slide
    // 3. And we're on a question step
    const shouldShowProgress = 
      userAgeRange !== null && 
      !isOnDidYouKnowSlide && 
      isQuestionStep(currentStep, allSteps);
                              
    setShowProgressBar(shouldShowProgress);
  }, [userAgeRange, currentStep, allSteps]);
  
  const handleBackNavigation = () => {
    // Check for special slides that need custom navigation
    const isOnDidYouKnowSlide = localStorage.getItem('showing_did_you_know') === 'true';
    const quizStarted = localStorage.getItem('quiz_started') === 'true';
    const hasAgeRange = userAgeRange !== null;
    const hasGender = localStorage.getItem('lucid_gender') !== null;
    
    // On age selection screen (has gender but no age range yet)
    if (hasGender && !hasAgeRange && !isOnDidYouKnowSlide && !quizStarted) {
      // Create and dispatch custom event to navigate back to gender selection
      const event = new CustomEvent('quiz-back-navigation', { detail: { screen: 'age-select' } });
      window.dispatchEvent(event);
      return;
    }
    
    // Create and dispatch custom events for special navigation cases
    if (isOnDidYouKnowSlide) {
      // On "Did You Know" slide - go back to age selection
      const event = new CustomEvent('quiz-back-navigation', { detail: { screen: 'did-you-know' } });
      window.dispatchEvent(event);
      return;
    }
    
    // If we're on the confirmation slide (has age range but quiz not started)
    if (hasAgeRange && !quizStarted && !isOnDidYouKnowSlide) {
      // On confirmation slide - go back to "Did You Know"
      const event = new CustomEvent('quiz-back-navigation', { detail: { screen: 'confirmation' } });
      window.dispatchEvent(event);
      return;
    }
    
    // If we're on the first question of the actual quiz
    if (quizStarted && currentStep === 0) {
      // On first question - go back to confirmation slide
      const event = new CustomEvent('quiz-back-navigation', { detail: { screen: 'first-question' } });
      window.dispatchEvent(event);
      return;
    }
    
    // For regular quiz questions after the first one
    if (currentStep > 0) {
      goToPrevStep();
    } else {
      // Fallback - navigate to home
      navigate('/');
    }
  };
  
  return (
    <header className="p-4">
      {/* Logo and back button row */}
      <div className="flex justify-center items-center relative">
        {/* Always show back button on quiz pages */}
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
      
      {/* Progress bar - only show if showProgressBar is true */}
      <AnimatePresence mode="popLayout">
        {showProgressBar && (
          <motion.div 
            className="mt-4 px-4"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeInOut",
              opacity: { duration: 0.4 },
              height: { duration: 0.5 }
            }}
          >
            <div className="w-full bg-lucid-lightGray h-3 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-lucid-pink"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default ProgressBar;
