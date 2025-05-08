import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProgressBar = () => {
  const { currentStep, totalSteps, goToPrevStep } = useQuiz();
  const progressPercentage = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  const navigate = useNavigate();
  
  // Calculate the question number - we add 1 to currentStep since it's zero-indexed
  const questionNumber = currentStep + 1;
  const totalQuestions = totalSteps > 0 ? totalSteps - 1 : 0; // Subtract 1 as the last step is typically the results page
  
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
              {questionNumber}/{totalQuestions}
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
