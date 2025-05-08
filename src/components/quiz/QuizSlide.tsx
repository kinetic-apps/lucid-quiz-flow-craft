import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, HelpCircle, Battery, Brain, Heart, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

type QuizSlideProps = {
  question: {
    id: string;
    type: 'radio' | 'boolean' | 'likert' | 'multiselect';
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

type QuestionOption = {
  id: string;
  text: string;
  value: number;
  order_number: number;
};

// Function to get the appropriate icon for Likert scale
const getLikertIcon = (value: number) => {
  if (value === 1 || value === 2) {
    return <ThumbsDown size={24} className="text-red-500" />;
  } else if (value === 3) {
    return <HelpCircle size={24} className="text-gray-500" />;
  } else {
    return <ThumbsUp size={24} className="text-green-500" />;
  }
};

// Function to get icon for multi-select options
const getOptionIcon = (text: string) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('energy') || lowerText.includes('tired')) {
    return <Battery size={24} className="text-green-500" />;
  } else if (lowerText.includes('worry')) {
    return <Brain size={24} className="text-green-500" />;
  } else if (lowerText.includes('emotional') || lowerText.includes('exhaustion')) {
    return <Heart size={24} className="text-green-500" />;
  } else if (lowerText.includes('overthinking')) {
    return <Brain size={24} className="text-green-500" />;
  } else if (lowerText.includes('irritability')) {
    return <AlertTriangle size={24} className="text-green-500" />;
  } else if (lowerText.includes('fine')) {
    return <CheckCircle2 size={24} className="text-green-500" />;
  } else {
    return <Zap size={24} className="text-green-500" />;
  }
};

// Function to sort options in the desired order: Always/Often first, Sometimes in the middle, Rarely/Never last
const sortOptions = (options: QuestionOption[]): QuestionOption[] => {
  return [...options].sort((a, b) => {
    const textA = a.text.toLowerCase();
    const textB = b.text.toLowerCase();
    
    // Always should be first
    if (textA.includes('always')) return -1;
    if (textB.includes('always')) return 1;
    
    // Often should be second
    if (textA.includes('often')) return -1;
    if (textB.includes('often')) return 1;
    
    // Sometimes should be in the middle
    if (textA.includes('sometimes') && (textB.includes('rarely') || textB.includes('never'))) return -1;
    if (textB.includes('sometimes') && (textA.includes('rarely') || textA.includes('never'))) return 1;
    
    // Rarely before Never
    if (textA.includes('rarely') && textB.includes('never')) return -1;
    if (textB.includes('rarely') && textA.includes('never')) return 1;
    
    // Default to original order
    return a.order_number - b.order_number;
  });
};

const QuizSlide = ({ question, quizId, stepIndex }: QuizSlideProps) => {
  const { setAnswer, goToNextStep, answers, currentStep } = useQuiz();
  const [selectedOption, setSelectedOption] = useState<string | boolean | number | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [animatingSelection, setAnimatingSelection] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const navigate = useNavigate();

  // Initialize selected option from saved answers
  useEffect(() => {
    const savedAnswer = answers.find(a => a.step === stepIndex);
    if (savedAnswer) {
      setSelectedOption(savedAnswer.value);
      setSelectedOptionId(savedAnswer.selected_option_id);
      
      // Handle multi-select answers if they're stored as a comma-separated string
      if (typeof savedAnswer.value === 'string' && savedAnswer.value.includes(',')) {
        const selectedIds = savedAnswer.value.split(',');
        setSelectedOptions(new Set(selectedIds));
      }
    } else {
      setSelectedOption(null);
      setSelectedOptionId(null);
      setSelectedOptions(new Set());
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

  // Handle multi-select option toggle
  const handleToggleOption = (optionId: string) => {
    setSelectedOptions(prev => {
      const newSelectedOptions = new Set(prev);
      if (newSelectedOptions.has(optionId)) {
        newSelectedOptions.delete(optionId);
      } else {
        newSelectedOptions.add(optionId);
      }
      return newSelectedOptions;
    });
  };

  // Handle continue for multi-select questions
  const handleMultiSelectContinue = () => {
    if (selectedOptions.size > 0) {
      const selectedIds = Array.from(selectedOptions).join(',');
      setAnswer(stepIndex, selectedIds, question.id);
      goToNextStep();
    }
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
    // Sort the options in the desired order for radio type questions
    const sortedOptions = question.type === 'radio' && question.optionsData ? 
      sortOptions(question.optionsData) : [];
      
    // Sort the options by order_number for likert scale
    const likertOptions = question.optionsData ? 
      [...question.optionsData].sort((a, b) => a.order_number - b.order_number) : [];
      
    switch (question.type) {
      case 'multiselect':
        return (
          <div>
            <div className="space-y-3 mt-6">
              {question.optionsData?.map((option) => {
                const isSelected = selectedOptions.has(option.id);
                
                return (
                  <motion.div
                    key={option.id}
                    className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                    }`}
                    onClick={() => handleToggleOption(option.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      borderColor: isSelected ? '#22c55e' : '#e5e7eb',
                      backgroundColor: isSelected ? '#f0fdf4' : 'white',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getOptionIcon(option.text)}
                      </div>
                      <span className="text-lg">{option.text}</span>
                    </div>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                      isSelected 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <motion.button
              className={`w-full mt-8 py-4 rounded-lg text-white font-medium ${
                selectedOptions.size > 0 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={selectedOptions.size === 0}
              onClick={handleMultiSelectContinue}
              whileHover={selectedOptions.size > 0 ? { scale: 1.02 } : {}}
              whileTap={selectedOptions.size > 0 ? { scale: 0.98 } : {}}
            >
              Continue
            </motion.button>
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-3 mt-6">
            {sortedOptions.map((option) => {
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
                    <span className="text-lg">{option.text}</span>
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
                  
                  <div className="flex items-center justify-center z-10 relative">
                    <span className="text-lg">{option.text}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );

      case 'likert':
        return (
          <div className="mt-8">
            {/* Likert scale in the style of the second image */}
            <div className="flex w-full justify-between">
              {likertOptions.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isAnimating = animatingSelection === option.id;
                
                return (
                  <div key={option.id} className="flex flex-col items-center">
                    <motion.div
                      className={`w-14 h-14 border border-gray-200 rounded-md flex items-center justify-center cursor-pointer transition-all mb-2 ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'hover:border-gray-300 hover:bg-gray-50 bg-white'
                      }`}
                      onClick={() => !isSelected && handleSelectOption(option.value, option.id)}
                      whileHover={!isSelected ? { scale: 1.1 } : {}}
                      whileTap={!isSelected ? { scale: 0.9 } : {}}
                      animate={{
                        borderColor: isAnimating || isSelected ? '#22c55e' : '#e5e7eb',
                        backgroundColor: isAnimating || isSelected ? '#f0fdf4' : 'white',
                        scale: isAnimating ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {getLikertIcon(option.value)}
                    </motion.div>
                    {option.order_number === 1 && (
                      <span className="text-xs text-gray-600">Strongly disagree</span>
                    )}
                    {option.order_number === 5 && (
                      <span className="text-xs text-gray-600">Strongly agree</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Determine instruction text based on question type
  const getInstructionText = () => {
    if (question.type === 'multiselect') {
      return "Choose all that apply";
    }
    return "Do you agree with the following statement?";
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
        <p className="text-gray-600 text-center mb-6">{getInstructionText()}</p>
      </div>

      {renderQuestionContent()}
    </motion.div>
  );
};

export default QuizSlide;
