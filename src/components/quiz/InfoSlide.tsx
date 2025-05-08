import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
      className="info-slide px-4 py-10 text-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Lucid was developed using evidence-based psychological practices
        </h2>
        <p className="text-gray-700 mb-8">
          Your plan is based on decades of research
        </p>
        
        <div className="flex flex-col items-center space-y-4 mt-8">
          <div className="university-logo bg-white rounded-lg shadow-sm p-4 w-64">
            <div className="text-center">
              <div className="font-serif text-xl font-bold">HARVARD</div>
              <div className="text-sm">UNIVERSITY</div>
            </div>
          </div>
          
          <div className="university-logo bg-white rounded-lg shadow-sm p-4 w-64">
            <div className="text-center">
              <div className="text-sm">UNIVERSITY OF</div>
              <div className="font-serif text-xl font-bold">OXFORD</div>
            </div>
          </div>
          
          <div className="university-logo bg-white rounded-lg shadow-sm p-4 w-64">
            <div className="text-center">
              <div className="text-sm">UNIVERSITY OF</div>
              <div className="font-serif text-xl font-bold">CAMBRIDGE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10 sticky bottom-0 pt-4 pb-4 bg-white">
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

export default InfoSlide; 