import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

type DidYouKnowSlideProps = {
  onContinue: () => void;
};

const DidYouKnowSlide = ({ onContinue }: DidYouKnowSlideProps) => {
  // Set localStorage flag on mount and clear on unmount
  useEffect(() => {
    // Set flag to hide progress bar
    localStorage.setItem('showing_did_you_know', 'true');
    
    // Cleanup on unmount
    return () => {
      localStorage.removeItem('showing_did_you_know');
    };
  }, []);
  
  return (
    <motion.div 
      className="bg-lucid-cream min-h-screen flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
      <div className="p-6 pt-12 flex-1 flex flex-col items-center">
        {/* Lightbulb Image */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.5,
            delay: 0.2
          }}
        >
          <img 
            src="/assets/lightbulb.png" 
            alt="Lightbulb" 
            width={120}
            height={120}
          />
        </motion.div>

        {/* Text Content */}
        <div className="text-center">
          <motion.h2 
            className="text-4xl font-medium font-dm-sans text-lucid-dark mb-4"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5,
              delay: 0.3
            }}
          >
            Did you know?
          </motion.h2>
          <motion.p 
            className="text-xl font-medium font-dm-sans text-lucid-dark mb-4"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5,
              delay: 0.4
            }}
          >
            Journaling helps improve mental health in 60% of people
          </motion.p>
          <motion.p 
            className="text-sm font-semibold font-dm-sans text-lucid-gray mb-6"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5,
              delay: 0.5
            }}
          >
            Mental health studies show that lorem ipsum lorem ipsum...
          </motion.p>
        </div>
      </div>
      
      {/* Continue Button */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-lucid-cream z-10"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.5,
          delay: 0.6
        }}
      >
        <button
          onClick={onContinue}
          type="button"
          className="w-full bg-lucid-dark text-lucid-cream py-4 rounded-full font-dm-sans font-semibold text-xl"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

export default DidYouKnowSlide; 