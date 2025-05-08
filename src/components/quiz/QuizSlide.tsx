import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

type QuizSlideProps = {
  question: {
    id: string;
    type: 'radio' | 'boolean' | 'likert';
    text: string;
    options?: string[];
    optionsData?: {
      id: string;
      text: string;
      value: number;
      order_number: number;
    }[];
  };
  quizId: string;
  stepIndex: number;
};

const QuizSlide = ({ question, quizId, stepIndex }: QuizSlideProps) => {
  const { setAnswer, goToNextStep, answers, currentStep } = useQuiz();
  const [selectedOption, setSelectedOption] = useState<string | boolean | number | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [animatingSelection, setAnimatingSelection] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const navigate = useNavigate();

  // Initialize selected option from saved answers
  useEffect(() => {
    const savedAnswer = answers.find(a => a.step === stepIndex);
    if (savedAnswer) {
      setSelectedOption(savedAnswer.value);
      setSelectedOptionId(savedAnswer.selected_option_id);
    } else {
      setSelectedOption(null);
      setSelectedOptionId(null);
    }
    setAnimatingSelection(null);
  }, [stepIndex, answers]);

  const handleSelectOption = (value: string | boolean | number, optionId: string) => {
    if (animatingSelection) return; // Prevent multiple rapid selections
    
    setSelectedOption(value);
    setSelectedOptionId(optionId);
    setAnimatingSelection(optionId);
    setAnswer(stepIndex, value, question.id, optionId);
    
    // Automatically advance to the next question after animation completes
    setTimeout(() => {
      goToNextStep();
      setAnimatingSelection(null);
    }, 600);
  };

  // Handle swipe back gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;
      
      // If swipe right to left (next), need more distance to trigger
      if (diff > 100 && selectedOption !== null) {
        goToNextStep();
      } 
      
      setTouchStart(null);
    }
  };

  // Render different question types
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'radio':
        return (
          <div className="space-y-3 mt-6">
            {question.optionsData?.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isAnimating = animatingSelection === option.id;
              
              return (
                <motion.div
                  key={option.id}
                  className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                  }`}
                  onClick={() => !isSelected && handleSelectOption(option.text, option.id)}
                  whileHover={!isSelected ? { scale: 1.02 } : {}}
                  whileTap={!isSelected ? { scale: 0.98 } : {}}
                  animate={{
                    borderColor: isAnimating ? '#7c3aed' : isSelected ? '#7c3aed' : '#e5e7eb',
                    backgroundColor: isAnimating ? '#ede9fe' : isSelected ? '#f5f3ff' : 'white',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isAnimating && (
                    <motion.div 
                      className="absolute inset-0 bg-purple-100 z-0"
                      initial={{ width: '0%', left: '50%', opacity: 0 }}
                      animate={{ width: '100%', left: '0%', opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                  
                  <div className="flex items-center z-10 relative w-full">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-all ${
                        isSelected || isAnimating
                          ? 'border-purple-600'
                          : 'border-gray-300'
                      }`}
                    >
                      <AnimatePresence>
                        {(isSelected || isAnimating) && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-3 h-3 rounded-full bg-purple-600" 
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <span className="text-lg">{option.text}</span>
                    
                    {isAnimating && (
                      <motion.div 
                        className="ml-auto"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                      >
                        <Check className="h-5 w-5 text-purple-600" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        );

      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {question.optionsData?.filter(o => o.text === 'Yes' || o.text === 'No').map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isAnimating = animatingSelection === option.id;
              
              return (
                <motion.div
                  key={option.id}
                  className={`p-4 border rounded-lg flex items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                  }`}
                  onClick={() => !isSelected && handleSelectOption(option.text, option.id)}
                  whileHover={!isSelected ? { scale: 1.05 } : {}}
                  whileTap={!isSelected ? { scale: 0.95 } : {}}
                  animate={{
                    borderColor: isAnimating ? '#7c3aed' : isSelected ? '#7c3aed' : '#e5e7eb',
                    backgroundColor: isAnimating ? '#ede9fe' : isSelected ? '#f5f3ff' : 'white',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isAnimating && (
                    <motion.div 
                      className="absolute inset-0 bg-purple-100 z-0"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                  
                  <span className="text-lg z-10 relative">{option.text}</span>
                  
                  {isAnimating && (
                    <motion.div 
                      className="absolute right-3"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                    >
                      <Check className="h-5 w-5 text-purple-600" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        );

      case 'likert':
        return (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 px-1 mb-2">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="flex justify-between">
              {question.optionsData?.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isAnimating = animatingSelection === option.id;
                
                return (
                  <motion.div
                    key={option.id}
                    className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => !isSelected && handleSelectOption(option.value, option.id)}
                    whileHover={!isSelected ? { scale: 1.1, backgroundColor: '#ddd6fe' } : {}}
                    whileTap={!isSelected ? { scale: 0.9 } : {}}
                    animate={{
                      backgroundColor: isAnimating ? '#7c3aed' : isSelected ? '#7c3aed' : '#f3f4f6',
                      color: isAnimating || isSelected ? 'white' : '#374151',
                      scale: isAnimating ? 1.1 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-lg">{option.order_number}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="quiz-slide"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">{question.text}</h2>
        <p className="text-gray-600 text-center mb-6">Select an option to continue</p>
      </div>

      {renderQuestionContent()}
    </motion.div>
  );
};

export default QuizSlide;
