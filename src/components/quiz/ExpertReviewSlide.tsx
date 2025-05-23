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
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-3 pt-6">
        {/* Title and Description */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-center mb-1 text-lucid-dark">
            Your plan will be reviewed by <span className="text-[#BC5867]">an expert</span>
          </h2>
          <p className="text-center text-lucid-dark/80 italic mb-3 text-xs px-2 font-serif">
            "Lucid carefully uses a proven approach to provide personalized guidance and resources that support emotional resilience."
          </p>
        </div>

        {/* Brain Image with Labels */}
        <div className="relative w-full max-w-xs mb-4 mx-auto">
          <img 
            src="/assets/brain-image.png" 
            alt="Brain diagram showing thoughts, feelings, and behavior" 
            className="w-full max-h-[35vh] object-contain"
          />
        </div>

        {/* Expert Card */}
        <div className="w-full max-w-xs mb-6 mx-auto">
          <div className="py-1 px-4 text-xs text-center rounded-t-lg font-medium">
            Content reviewed by an expert
          </div>
          <div className="bg-lucid-cream border-x border-b border-purple-100 rounded-b-lg p-2 flex items-center">
            <div className="bg-[#BC5867] rounded-full p-1 mr-2">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-lucid-dark">Anieta Dixon</h3>
              <p className="text-xs text-lucid-dark/70">Counselling Expert (M.A.), SME</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-shrink-0 p-3 bg-lucid-cream continue-button-container">
        <button
          onClick={goToNextStep}
          className="w-full bg-lucid-dark text-lucid-cream py-2.5 rounded-full font-medium text-base"
        >
          Continue <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      </div>
    </motion.div>
  );
};

export default ExpertReviewSlide; 