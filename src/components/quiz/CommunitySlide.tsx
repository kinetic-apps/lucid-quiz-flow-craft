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
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="community-slide min-h-screen flex flex-col bg-lucid-cream"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 p-6 pt-12 flex flex-col items-center">
        {/* Community Image */}
        <div className="w-full max-w-md mb-10 flex justify-center">
          <img 
            src="/assets/image.png" 
            alt="Community of people" 
            className="w-full max-w-md"
          />
        </div>

        {/* Text Content */}
        <h2 className="text-3xl font-bold text-center mb-4 text-lucid-dark">
          Join over 1,000,000 people
        </h2>
        <p className="text-center text-lucid-dark/80 px-6 max-w-sm text-lg font-serif">
          Become part of a growing worldwide community and achieve your goals with us!
        </p>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-lucid-cream z-10">
        <button
          onClick={goToNextStep}
          className="w-full bg-lucid-dark text-lucid-cream py-4 rounded-full font-medium text-xl"
        >
          Continue <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      </div>
    </motion.div>
  );
};

export default CommunitySlide; 