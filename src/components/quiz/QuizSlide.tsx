import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
  const { setAnswer, goToNextStep, goToPrevStep, answers } = useQuiz();
  const [selectedOption, setSelectedOption] = useState<string | boolean | number | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

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
  };

  const handleNext = () => {
    if (selectedOption !== null) {
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
      if (diff > 100) {
        handleNext();
      } 
      // If swipe left to right (previous), less distance needed
      else if (diff < -50) {
        goToPrevStep();
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
                className={`p-4 border rounded-lg h-12 flex items-center cursor-pointer transition-all ${
                  selectedOptionId === option.id
                    ? 'border-lucid-violet-600 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectOption(option.text, option.id)}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                    selectedOptionId === option.id
                      ? 'border-lucid-violet-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedOptionId === option.id && (
                    <div className="w-3 h-3 rounded-full bg-lucid-violet-600" />
                  )}
                </div>
                <span>{option.text}</span>
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
                className={`p-4 border rounded-lg flex items-center justify-center cursor-pointer h-12 transition-all ${
                  selectedOptionId === option.id
                    ? 'border-lucid-violet-600 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectOption(option.text, option.id)}
              >
                <span>{option.text}</span>
              </div>
            ))}
          </div>
        );

      case 'likert':
        return (
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 px-1 mb-2">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="flex justify-between">
              {question.optionsData?.map((option) => (
                <div
                  key={option.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    selectedOptionId === option.id
                      ? 'bg-lucid-violet-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleSelectOption(option.value, option.id)}
                >
                  {option.order_number}
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{question.text}</h2>
        <p className="text-gray-500 text-sm">Select an option to continue</p>
      </div>

      {renderQuestionContent()}

      <div className="flex justify-between mt-8 sticky bottom-0 pt-4 pb-4 bg-white">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevStep}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedOption === null}
          className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white flex items-center"
        >
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizSlide;
