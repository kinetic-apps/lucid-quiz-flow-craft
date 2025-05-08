
import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type TipSlideProps = {
  tip: {
    id: string;
    title: string;
    content: string;
    image_url?: string;
  };
  quizId: string;
};

const TipSlide = ({ tip, quizId }: TipSlideProps) => {
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
      className="tip-slide"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{tip.title}</h2>
        
        {tip.image_url && (
          <div className="mb-4">
            <img 
              src={tip.image_url} 
              alt={tip.title}
              className="rounded-lg w-full object-cover max-h-48" 
            />
          </div>
        )}
        
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {tip.content}
        </div>
      </div>

      <div className="flex justify-between mt-6 sticky bottom-0 pt-4 pb-4 bg-white">
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
        >
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default TipSlide;
