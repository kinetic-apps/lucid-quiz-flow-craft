
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';

const ProgressBar = () => {
  const { currentStep, totalSteps } = useQuiz();
  const progressPercentage = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <span>Progress</span>
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
