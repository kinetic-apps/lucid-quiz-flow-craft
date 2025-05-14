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
    // Only show progress bar if:
    // 1. We have an age range selected (meaning we've passed the age selection step)
    // 2. And it's a question step (not intro screens)
    // Remove the currentStep > 0 condition since we want to show the progress bar
    // immediately after age selection, even on the first question
    const shouldShowProgress = userAgeRange !== null && isQuestionStep(currentStep, allSteps);
    setShowProgressBar(shouldShowProgress);
  }, [userAgeRange, currentStep, allSteps]);
  
  const handleBackNavigation = () => {
    if (currentStep > 0) {
      goToPrevStep();
    } else {
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
      <AnimatePresence>
        {showProgressBar && (
          <motion.div 
            className="mt-4 px-4"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
              opacity: { duration: 0.3 },
              height: { duration: 0.3 }
            }}
          >
            <div className="w-full bg-lucid-lightGray h-3 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-lucid-pink"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default ProgressBar;
