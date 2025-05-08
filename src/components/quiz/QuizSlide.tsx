import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useNavigate } from 'react-router-dom';

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
  }, [stepIndex, answers]);

  const handleSelectOption = (value: string | boolean | number, optionId: string) => {
    setSelectedOption(value);
    setSelectedOptionId(optionId);
    setAnswer(stepIndex, value, question.id, optionId);
    
    // Automatically advance to the next question after a brief delay
    setTimeout(() => {
      goToNextStep();
    }, 300);
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
            {question.optionsData?.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all ${
                  selectedOptionId === option.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleSelectOption(option.text, option.id)}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                    selectedOptionId === option.id
                      ? 'border-purple-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedOptionId === option.id && (
                    <div className="w-3 h-3 rounded-full bg-purple-600" />
                  )}
                </div>
                <span className="text-lg">{option.text}</span>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {question.optionsData?.filter(o => o.text === 'Yes' || o.text === 'No').map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  selectedOptionId === option.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleSelectOption(option.text, option.id)}
              >
                <span className="text-lg">{option.text}</span>
              </div>
            ))}
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
              {question.optionsData?.map((option) => (
                <div
                  key={option.id}
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    selectedOptionId === option.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleSelectOption(option.value, option.id)}
                >
                  <span className="text-lg">{option.order_number}</span>
                </div>
              ))}
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
