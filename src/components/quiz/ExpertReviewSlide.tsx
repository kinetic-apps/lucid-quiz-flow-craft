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
      className="expert-review-slide bg-lucid-cream h-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content */}
      <div className="flex-1 px-4 py-4 flex flex-col items-center justify-between">
        <div className="flex flex-col items-center">
          {/* Brain Diagram */}
          <div className="relative w-48 h-48 mb-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5">
              <span className="text-sm font-medium text-lucid-dark">Thoughts</span>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full px-3 py-0.5">
              <span className="text-sm font-medium text-lucid-dark">Feelings</span>
            </div>
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5">
              <span className="text-sm font-medium text-lucid-dark">Behavior</span>
            </div>
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg width="80" height="80" viewBox="0 0 100 100" className="opacity-80">
                <path d="M50,0 A50,50 0 0 1 100,50 A50,50 0 0 1 50,100 A50,50 0 0 1 0,50 A50,50 0 0 1 50,0 z" 
                  fill="none" stroke="#DDD" strokeWidth="2" />
                <g transform="translate(25, 25)">
                  <path d="M25,0 C35,0 50,20 50,35 C50,50 35,50 25,50 C15,50 0,50 0,35 C0,20 15,0 25,0" 
                    fill="#d8b4fe" opacity="0.5" />
                </g>
              </svg>
            </div>
          </div>

          {/* Expert Review Text */}
          <h2 className="text-xl font-bold text-center mb-1 text-lucid-dark">
            Your plan will be reviewed by <span className="text-a855f7">an expert</span>
          </h2>

          {/* Quote */}
          <p className="text-center text-lucid-dark/80 italic mb-8 text-sm px-6 font-serif">
            "Lucid carefully uses a proven approach to provide personalized guidance and resources that support emotional resilience."
          </p>

          {/* Expert Card */}
          <div className="w-full max-w-md">
            <div className="bg-purple-100 py-1 px-4 text-xs text-center rounded-t-lg font-medium">
              Content reviewed by an expert
            </div>
            <div className="bg-lucid-cream border-x border-b border-purple-100 rounded-b-lg p-3 flex items-center">
              <div className="bg-purple-500 rounded-full p-1.5 mr-3">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-lucid-dark">Anieta Dixon</h3>
                <p className="text-xs text-lucid-dark/70">Counselling Expert (M.A.), SME</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between w-full mt-10 pt-4 pb-4">
          <button
            onClick={goToPrevStep}
            className="px-6 py-3 rounded-full text-lucid-dark flex items-center font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <button
            onClick={goToNextStep}
            className="px-6 py-3 rounded-full bg-lucid-dark text-white flex items-center font-medium"
          >
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpertReviewSlide; 