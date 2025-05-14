import React from 'react';
import { motion } from 'framer-motion';
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
  const { currentStep, totalSteps, goToPrevStep, allSteps } = useQuiz();
  const progressPercentage = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  const navigate = useNavigate();
  
  // Check if this step should show the progress bar
  const shouldShowProgress = isQuestionStep(currentStep, allSteps);
  
  // If this isn't a question step, don't show the progress bar
  if (!shouldShowProgress) {
    return (
      <div className="w-full">
        <div className="flex justify-start items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPrevStep()}
            className="p-0 h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Calculate the question number - we add 1 to currentStep since it's zero-indexed
  const questionNumber = currentStep + 1;
  
  // Count only question steps for the total questions display
  const totalQuestions = allSteps.filter(step => step.type === 'question').length;
  
  // Calculate the current question number (count only previous questions)
  const currentQuestionNumber = allSteps
    .slice(0, currentStep + 1)
    .filter(step => step.type === 'question')
    .length;
  
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
      
      {/* Progress bar */}
      <div className="mt-4 px-4">
        <div className="w-full bg-lucid-lightGray h-3 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-lucid-pink"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </header>
  );
};

export default ProgressBar;
