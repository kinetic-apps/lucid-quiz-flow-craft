import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, HelpCircle, Battery, Brain, Heart, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { usePostHog } from '@/context/PostHogContext';
import { createPortal } from 'react-dom';

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
  if (value === 5) { // Strongly Agree
    return <ThumbsUp size={24} className="text-red-700" />; // Bolder red
  } else if (value === 4) { // Agree
    return <ThumbsUp size={24} className="text-lucid-pink" />; // #BC5867
  } else if (value === 3) { // Neutral
    return <HelpCircle size={24} className="text-lucid-gray" />;
  } else if (value === 2) { // Disagree
    return <ThumbsDown size={24} className="text-lucid-gray" />; // Grey
  } else if (value === 1) { // Strongly Disagree
    return <ThumbsDown size={24} className="text-lucid-dark" />; // Black (using lucid-dark)
  } else { // Fallback, though ideally all likert values should be covered
    return <HelpCircle size={24} className="text-lucid-gray" />;
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

// Function to sort options in the desired order
const sortOptions = (options: QuestionOption[]): QuestionOption[] => {
  const getRank = (text: string): number => {
    const lower = text.toLowerCase();
    if (lower === 'strongly agree') return 1;
    if (lower === 'agree') return 2;
    if (lower === 'neutral') return 3;
    if (lower === 'disagree') return 4;
    if (lower === 'strongly disagree') return 5;
    return 6; // Fallback rank for texts not in the standard set, ensuring they are sorted after
  };

  return [...options].sort((a, b) => {
    const textA = a.text.toLowerCase();
    const textB = b.text.toLowerCase();

    // Check if both options are part of the standard agree/disagree/neutral set
    const isStandardLikertA = (textA === 'strongly agree' || textA === 'agree' || textA === 'neutral' || textA === 'disagree' || textA === 'strongly disagree');
    const isStandardLikertB = (textB === 'strongly agree' || textB === 'agree' || textB === 'neutral' || textB === 'disagree' || textB === 'strongly disagree');

    if (isStandardLikertA && isStandardLikertB) {
      const rankA = getRank(textA);
      const rankB = getRank(textB);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      // If ranks are somehow the same (e.g., duplicate options text), maintain original relative order
      return a.order_number - b.order_number;
    }

    // Original frequency-based sorting for other types of Likert scales (Always, Often, etc.)
    // This block is reached if at least one of the options is not a standard agree/disagree type.
    if (textA.includes('always')) return -1;
    if (textB.includes('always')) return 1;

    if (textA.includes('often')) return -1;
    if (textB.includes('often')) return 1;

    if (textA.includes('sometimes') && (textB.includes('rarely') || textB.includes('never'))) return -1;
    if (textB.includes('sometimes') && (textA.includes('rarely') || textA.includes('never'))) return 1;

    if (textA.includes('rarely') && textB.includes('never')) return -1;
    if (textB.includes('rarely') && textA.includes('never')) return 1;

    // Default to original order_number if no other rules apply or if types are mixed unexpectedly
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

  const optionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeIn" } }
  };

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
    }, 200);
  };

  const handleToggleOption = (optionId: string) => {
    // First, create a new selection set without updating state yet
    const newSelection = new Set(selectedOptions);
    
    // Toggle the selection
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
    
    // Update local state
    setSelectedOptions(newSelection);
    
    // Update the answer in context after the current render cycle
    setTimeout(() => {
      setAnswer(stepIndex, ids, question.id);
    }, 0);
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
    // For multiselect questions, we need a different layout
    if (question.type === 'multiselect') {
      return (
        <>
          <div className="quiz-content-scrollable p-6 pt-12">
            <motion.div className="mb-4">
              <h2 className="text-2xl font-medium text-lucid-dark mb-2">{question.text}</h2>
              <p className="text-sm text-lucid-gray">{getInstructionText()}</p>
            </motion.div>
            
            <div className="space-y-3">
              {(question.optionsData || []).map((option, index) => {
                const isSelected = selectedOptions.has(option.id);
                const isAnimating = animatingSelection === option.id;

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleToggleOption(option.id)}
                    className={`
                      w-full p-4 rounded-xl border-2 text-left transition-all duration-150 ease-in-out
                      flex items-center justify-between text-sm sm:text-base
                      ${
                        isSelected
                          ? 'bg-lucid-pink/20 border-lucid-pink text-lucid-pink'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                      ${isAnimating ? 'scale-95' : ''}
                    `}
                    whileHover={{ scale: isSelected ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">{option.text}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-lucid-pink border-lucid-pink' : 'border-gray-300'}
                    `}>
                      {isSelected && (
                        <motion.div
                          className="w-2.5 h-2.5 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.15 }}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Fixed Continue Button for multiselect */}
          <div className="continue-button-container">
            <motion.button
              className={`
                w-full py-3 px-6 rounded-full text-white text-lg font-medium text-center
                ${selectedOptions.size > 0 ? 'bg-lucid-dark' : 'bg-gray-300 cursor-not-allowed'}
              `}
              onClick={handleSubmitMultiSelect}
              disabled={selectedOptions.size === 0}
              whileTap={selectedOptions.size > 0 ? { scale: 0.98 } : {}}
            >
              Continue
            </motion.button>
          </div>
        </>
      );
    }

    // For other question types (radio, boolean, likert)
    return (
      <div className="quiz-content-scrollable quiz-content-with-button p-6 pt-12">
        <motion.div className="mb-4">
          <h2 className="text-2xl font-medium text-lucid-dark mb-2">{question.text}</h2>
          <p className="text-sm text-lucid-gray">{getInstructionText()}</p>
        </motion.div>

        {question.type === 'radio' && (
          <div className="grid grid-cols-1 gap-3">
              {(question.optionsData || []).map((option) => (
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
                  <span className="font-lexend text-lg text-lucid-dark text-left">{option.text}</span>
                </motion.div>
              ))}
          </div>
        )}

        {question.type === 'boolean' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <motion.div
                className={`
                  border rounded-xl p-4 cursor-pointer flex items-center transition-colors
                  ${selectedOption === true 
                    ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                    : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
                  ${animatingSelection === 'true' ? 'opacity-75' : 'opacity-100'}
                `}
                onClick={() => handleSelectOption(true, 'true')}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <span className="font-lexend text-lg text-lucid-dark text-left">{
                question.text === 'What is your age?' ? 'Under 20' : 'Yes'}</span>
              </motion.div>
              <motion.div
                className={`
                  border rounded-xl p-4 cursor-pointer flex items-center transition-colors
                  ${selectedOption === false 
                    ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                    : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
                  ${animatingSelection === 'false' ? 'opacity-75' : 'opacity-100'}
                `}
                onClick={() => handleSelectOption(false, 'false')}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <span className="font-lexend text-lg text-lucid-dark text-left">{
                question.text === 'What is your age?' ? '20-30' : 'No'}</span>
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
                  <span className="font-lexend text-lg text-lucid-dark text-left">{option.text}</span>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    );
  };

  // Determine instruction text based on question type
  const getInstructionText = () => {
    if (question.type === 'multiselect') {
      return "Choose all that apply";
    }
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="quiz-slide-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {renderQuestionContent()}
    </motion.div>
  );
};

export default QuizSlide;
