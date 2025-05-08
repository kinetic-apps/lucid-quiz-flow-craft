import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

type ExpertReviewSlideProps = {
  quizId: string;
};

const ExpertReviewSlide = ({ quizId }: ExpertReviewSlideProps) => {
  const { goToNextStep, goToPrevStep } = useQuiz();
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  // Handle swipe back gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;
      
      // If swipe right to left (next)
      if (diff > 100) {
        goToNextStep();
      } 
      // If swipe left to right (previous)
      else if (diff < -50) {
        goToPrevStep();
      }
      
      setTouchStart(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="expert-review-slide bg-gray-50 h-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content */}
      <div className="flex-1 px-4 py-4 flex flex-col items-center justify-between">
        <div className="flex flex-col items-center">
          {/* Brain Diagram */}
          <div className="relative w-48 h-48 mb-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-0.5 shadow-sm">
              <span className="text-sm font-medium">Thoughts</span>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full px-3 py-0.5 shadow-sm">
              <span className="text-sm font-medium">Feelings</span>
            </div>
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-0.5 shadow-sm">
              <span className="text-sm font-medium">Behavior</span>
            </div>
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg width="80" height="80" viewBox="0 0 100 100" className="opacity-80">
                <path d="M50,0 A50,50 0 0 1 100,50 A50,50 0 0 1 50,100 A50,50 0 0 1 0,50 A50,50 0 0 1 50,0 z" 
                  fill="none" stroke="#DDD" strokeWidth="2" />
                <g transform="translate(25, 25)">
                  <path d="M25,0 C35,0 50,20 50,35 C50,50 35,50 25,50 C15,50 0,50 0,35 C0,20 15,0 25,0" 
                    fill="#7c3aed" opacity="0.2" />
                </g>
              </svg>
            </div>
          </div>

          {/* Expert Review Text */}
          <h2 className="text-xl font-bold text-center mb-1">
            Your plan will be reviewed by <span className="text-lucid-violet-600">an expert</span>
          </h2>

          {/* Quote */}
          <p className="text-center text-gray-700 italic mb-4 text-sm px-2">
            "Lucid carefully uses a proven approach to provide personalized guidance and resources that support emotional resilience."
          </p>

          {/* Expert Card */}
          <div className="w-full max-w-md">
            <div className="bg-lucid-violet-600/10 py-0.5 px-4 text-xs text-center rounded-t-lg">
              Content reviewed by an expert
            </div>
            <div className="bg-white border border-gray-200 rounded-b-lg p-3 flex items-center">
              <div className="bg-lucid-violet-600 rounded-full p-1.5 mr-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Anieta Dixon</h3>
                <p className="text-xs text-gray-600">Counselling Expert (M.A.), SME</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between w-full mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevStep}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            onClick={goToNextStep}
            className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white flex items-center"
            size="sm"
          >
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertReviewSlide; 