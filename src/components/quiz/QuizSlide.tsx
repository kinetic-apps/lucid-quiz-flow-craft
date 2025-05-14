import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, HelpCircle, Battery, Brain, Heart, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePostHog } from '@/context/PostHogContext';

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
    return <ThumbsDown size={24} className="text-lucid-pink" />;
  } else if (value === 3) {
    return <HelpCircle size={24} className="text-lucid-gray" />;
  } else {
    return <ThumbsUp size={24} className="text-lucid-dark" />;
  }
};

// Function to get icon for multi-select options
const getOptionIcon = (text: string) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('energy') || lowerText.includes('tired')) {
    return <Battery size={24} className="text-lucid-dark" />;
  } else if (lowerText.includes('worry')) {
    return <Brain size={24} className="text-lucid-dark" />;
  } else if (lowerText.includes('emotional') || lowerText.includes('exhaustion')) {
    return <Heart size={24} className="text-lucid-dark" />;
  } else if (lowerText.includes('overthinking')) {
    return <Brain size={24} className="text-lucid-dark" />;
  } else if (lowerText.includes('irritability')) {
    return <AlertTriangle size={24} className="text-lucid-dark" />;
  } else if (lowerText.includes('fine')) {
    return <CheckCircle2 size={24} className="text-lucid-dark" />;
  } else {
    return <Zap size={24} className="text-lucid-dark" />;
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
  const { track } = usePostHog();
  const [selectedOption, setSelectedOption] = useState<string | boolean | number | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [animatingSelection, setAnimatingSelection] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [questionViewTime, setQuestionViewTime] = useState<number>(Date.now());
  const navigate = useNavigate();

  // Track when question is viewed
  useEffect(() => {
    const timestamp = Date.now();
    setQuestionViewTime(timestamp);
    
    // Track question view
    track('question_viewed', {
      question_id: question.id,
      question_text: question.text,
      question_type: question.type,
      step_index: stepIndex,
      quiz_id: quizId,
      timestamp
    });
    
    // Cleanup function that will run when component unmounts or when deps change
    return () => {
      const timeSpent = Date.now() - timestamp;
      
      // Track time spent on question when leaving
      track('question_time_spent', {
        question_id: question.id,
        step_index: stepIndex,
        quiz_id: quizId,
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.round(timeSpent / 1000)
      });
    };
  }, [question.id, stepIndex, track, quizId, question.text, question.type]);

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
    
    // Track option selection
    const timeToAnswer = Date.now() - questionViewTime;
    track('option_selected', {
      question_id: question.id,
      question_type: question.type,
      step_index: stepIndex,
      quiz_id: quizId,
      option_id: optionId,
      option_value: String(value),
      time_to_answer_ms: timeToAnswer,
      time_to_answer_seconds: Math.round(timeToAnswer / 1000)
    });
    
    // Automatically advance to the next question after animation completes
    setTimeout(() => {
      goToNextStep();
      setAnimatingSelection(null);
    }, 600);
  };

  const handleToggleOption = (optionId: string) => {
    setSelectedOptions(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(optionId)) {
        newSelection.delete(optionId);
        
        // Track option deselection
        track('option_deselected', {
          question_id: question.id,
          question_type: 'multiselect',
          step_index: stepIndex,
          quiz_id: quizId,
          option_id: optionId
        });
      } else {
        newSelection.add(optionId);
        
        // Track option selection
        track('option_selected', {
          question_id: question.id,
          question_type: 'multiselect',
          step_index: stepIndex,
          quiz_id: quizId,
          option_id: optionId,
          is_multiple: true
        });
      }
      
      // Store the comma-separated string of selected ids
      const ids = Array.from(newSelection).join(',');
      setAnswer(stepIndex, ids, question.id);
      
      return newSelection;
    });
  };

  const handleSubmitMultiSelect = () => {
    if (selectedOptions.size === 0) return;
    
    // Track multiselect submission
    track('multiselect_submitted', {
      question_id: question.id,
      step_index: stepIndex,
      quiz_id: quizId,
      num_selections: selectedOptions.size,
      selected_options: Array.from(selectedOptions)
    });
    
    goToNextStep();
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // Detect left or right swipe (minimum 50px movement)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left (forward)
        track('question_swiped', {
          direction: 'left',
          question_id: question.id,
          step_index: stepIndex
        });
        goToNextStep();
      } else {
        // Swipe right (backward)
        track('question_swiped', {
          direction: 'right',
          question_id: question.id,
          step_index: stepIndex
        });
        // Handle back navigation if needed
      }
    }
    
    setTouchStart(null);
  };

  // Render different question types
  const renderQuestionContent = () => {
    return (
      <div className="flex flex-col h-full">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-dm-sans font-medium text-lucid-dark mb-4">{question.text}</h2>
          <p className="text-sm font-dm-sans text-lucid-gray">{getInstructionText()}</p>
        </motion.div>

        {question.type === 'radio' && (
          <div className="grid grid-cols-1 gap-3">
            {(question.optionsData || []).map((option) => (
              <motion.div
                key={option.id}
                className={`
                  border rounded-xl p-4 cursor-pointer transition-colors
                  ${selectedOptionId === option.id 
                    ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                    : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
                  ${animatingSelection === option.id ? 'opacity-75' : 'opacity-100'}
                `}
                onClick={() => handleSelectOption(option.value, option.id)}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <span className="font-lexend text-lg text-lucid-dark">{option.text}</span>
              </motion.div>
            ))}
          </div>
        )}

        {question.type === 'boolean' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.div
              className={`
                border rounded-xl p-4 cursor-pointer flex items-center justify-center transition-colors
                ${selectedOption === true 
                  ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                  : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
                ${animatingSelection === 'true' ? 'opacity-75' : 'opacity-100'}
              `}
              onClick={() => handleSelectOption(true, 'true')}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <span className="font-lexend text-lg text-lucid-dark">Yes</span>
            </motion.div>
            <motion.div
              className={`
                border rounded-xl p-4 cursor-pointer flex items-center justify-center transition-colors
                ${selectedOption === false 
                  ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                  : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
                ${animatingSelection === 'false' ? 'opacity-75' : 'opacity-100'}
              `}
              onClick={() => handleSelectOption(false, 'false')}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <span className="font-lexend text-lg text-lucid-dark">No</span>
            </motion.div>
          </div>
        )}

        {question.type === 'likert' && (
          <div className="grid grid-cols-1 gap-3">
            {/* Likert options sorted from Never to Always */}
            {sortOptions(question.optionsData || []).map((option) => (
              <motion.div
                key={option.id}
                className={`
                  border rounded-xl p-4 cursor-pointer transition-colors flex items-center
                  ${selectedOptionId === option.id 
                    ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                    : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
                  ${animatingSelection === option.id ? 'opacity-75' : 'opacity-100'}
                `}
                onClick={() => handleSelectOption(option.value, option.id)}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <div className="mr-3">
                  {getLikertIcon(option.value)}
                </div>
                <span className="font-lexend text-lg text-lucid-dark">{option.text}</span>
              </motion.div>
            ))}
          </div>
        )}

        {question.type === 'multiselect' && (
          <>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {(question.optionsData || []).map((option) => (
                <motion.div
                  key={option.id}
                  className={`
                    border rounded-xl p-4 cursor-pointer transition-colors flex items-center
                    ${selectedOptions.has(option.id) 
                      ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                      : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
                  `}
                  onClick={() => handleToggleOption(option.id)}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="mr-3">
                    {getOptionIcon(option.text)}
                  </div>
                  <span className="font-lexend text-lg text-lucid-dark">{option.text}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-auto">
              <motion.button
                className={`
                  w-full py-3 px-6 rounded-xl text-white text-lg font-medium
                  ${selectedOptions.size > 0 ? 'bg-lucid-pink' : 'bg-gray-300 cursor-not-allowed'}
                `}
                onClick={handleSubmitMultiSelect}
                disabled={selectedOptions.size === 0}
                whileTap={selectedOptions.size > 0 ? { scale: 0.98 } : {}}
              >
                Continue
              </motion.button>
            </div>
          </>
        )}
      </div>
    );
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
      className="quiz-slide pb-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {renderQuestionContent()}
    </motion.div>
  );
};

export default QuizSlide;
