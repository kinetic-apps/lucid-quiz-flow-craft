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
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackNavigation}
            className="p-0 h-8 w-8 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span>Progress</span>
          {totalQuestions > 0 && (
            <span className="ml-2 font-medium">
              {currentQuestionNumber}/{totalQuestions}
            </span>
          )}
        </div>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div 
          className="h-full bg-lucid-violet-600"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
