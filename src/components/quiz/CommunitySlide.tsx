import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';

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

  // User avatars positioning data for the visualization
  const avatarPositions = [
    { top: '25%', left: '20%', size: 'w-10 h-10' }, // A
    { top: '32%', left: '35%', size: 'w-12 h-12' }, // B
    { top: '22%', left: '45%', size: 'w-10 h-10' }, // C
    { top: '35%', left: '28%', size: 'w-12 h-12' }, // D
    { top: '45%', left: '25%', size: 'w-10 h-10' }, // E
    { top: '18%', left: '38%', size: 'w-10 h-10' }, // F
    { top: '38%', left: '55%', size: 'w-10 h-10' }, // G
    { top: '28%', left: '52%', size: 'w-12 h-12' }  // H
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="community-slide flex flex-col h-full bg-lucid-cream"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 flex flex-col items-center justify-between py-8 px-4">
        <div className="w-full flex flex-col items-center">
          {/* Visualization */}
          <div className="relative w-full h-60 mb-8 bg-blue-50/30 rounded-lg flex items-center justify-center">
            {/* User Avatars */}
            {avatarPositions.map((pos, index) => (
              <div 
                key={index}
                className="absolute"
                style={{ 
                  top: pos.top, 
                  left: pos.left,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div 
                  className={`${pos.size} rounded-full flex items-center justify-center bg-purple-500`}
                >
                  <div className="text-white font-bold text-base">
                    {String.fromCharCode(65 + index)}
                  </div>
                </div>
              </div>
            ))}
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
        <button
          onClick={goToNextStep}
          className="w-full max-w-md py-4 px-8 rounded-full bg-[#8a3bf9] text-white font-medium text-lg mt-10"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default CommunitySlide; 