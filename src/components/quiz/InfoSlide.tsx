import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

type InfoSlideProps = {
  title: string;
  content: string;
  quizId: string;
};

const InfoSlide = ({ title, content, quizId }: InfoSlideProps) => {
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
      className="info-slide bg-lucid-cream min-h-screen flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 p-6 pt-12 flex flex-col items-center">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-lucid-dark mb-3">
            Lucid was developed using evidence-based psychological practices
          </h2>
          <p className="text-lucid-dark mb-8">
            Your plan is based on decades of research
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-6 mt-8 w-full max-w-md">
          <div className="university-logo w-full rounded-lg p-4 flex justify-center">
            <img 
              src="/assets/harvard.png" 
              alt="Harvard University" 
              className="h-auto max-w-full"
            />
          </div>
          
          <div className="university-logo w-full rounded-lg p-4 flex justify-center">
            <img 
              src="/assets/cambridge.png" 
              alt="University of Cambridge" 
              className="h-auto max-w-full"
            />
          </div>
        </div>
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

export default InfoSlide; 