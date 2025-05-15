import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

type CommunitySlideProps = {
  quizId: string;
};

const CommunitySlide = ({ quizId }: CommunitySlideProps) => {
  const { goToNextStep } = useQuiz();
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  // Handle swipe gesture
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
      
      setTouchStart(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="community-slide min-h-screen flex flex-col bg-lucid-cream relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 p-4 pt-8 flex flex-col items-center pb-24 overflow-y-auto">
        {/* Community Image */}
        <div className="w-full max-w-xs mb-6 flex justify-center">
          <img 
            src="/assets/image.png" 
            alt="Community of people" 
            className="w-full max-w-full"
          />
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-center mb-3 text-lucid-dark">
          Join over 1,000,000 people
        </h2>
        <p className="text-center text-lucid-dark/80 px-4 max-w-sm text-base">
          Become part of a growing worldwide community and achieve your goals with us!
        </p>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-lucid-cream z-10">
        <button
          onClick={goToNextStep}
          className="w-full bg-lucid-dark text-lucid-cream py-3 rounded-full font-medium text-lg"
        >
          Continue <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      </div>
    </motion.div>
  );
};

export default CommunitySlide; 