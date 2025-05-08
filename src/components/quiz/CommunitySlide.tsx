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

  // User avatars positioning data for the world map
  const avatarPositions = [
    { top: '20%', left: '15%', color: '#34D399' }, // North America
    { top: '25%', left: '35%', color: '#10B981' }, // Europe
    { top: '20%', left: '55%', color: '#059669' }, // Asia
    { top: '35%', left: '25%', color: '#047857' }, // Africa
    { top: '45%', left: '20%', color: '#065F46' }, // South America
    { top: '15%', left: '42%', color: '#047857' }, // Northern Europe
    { top: '50%', left: '75%', color: '#059669' }, // Australia
    { top: '30%', left: '65%', color: '#10B981' }  // East Asia
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="community-slide flex flex-col h-full bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 flex flex-col items-center justify-between py-8 px-4">
        <div className="w-full flex flex-col items-center">
          {/* World Map with User Avatars */}
          <div className="relative w-full h-48 mb-6">
            {/* World Map */}
            <img 
              src="/world-map-dots.svg" 
              alt="World map" 
              className="w-full opacity-20"
            />

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
                  className="rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: pos.color }}
                >
                  <div className="text-white font-bold text-xs">
                    {String.fromCharCode(65 + index)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-bold text-center mb-4">
            Join over 1,000,000 people
          </h2>
          <p className="text-center text-gray-700 px-4 max-w-sm">
            Become part of a growing worldwide community and achieve your goals with us!
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={goToNextStep}
          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-4 mt-8"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default CommunitySlide; 