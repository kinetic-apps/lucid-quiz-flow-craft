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
  
  // Single animation variant that will be used for all content
  const contentAnimation = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <motion.div 
      className="quiz-slide-container bg-lucid-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Scrollable content area */}
      <motion.div 
        className="quiz-content-scrollable quiz-content-with-button p-6 pt-12"
        initial="hidden"
        animate="visible"
        variants={contentAnimation}
      >
        {/* Lightbulb Image */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/assets/lightbulb.png" 
            alt="Lightbulb" 
            width={120}
            height={120}
          />
        </div>

        {/* Text Content */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-medium text-lucid-dark mb-4">
            Did you know?
          </h2>
          <p className="text-xl font-medium text-lucid-dark mb-4">
            Journaling helps improve mental health in 60% of people
          </p>
          <p className="text-sm font-semibold text-lucid-gray mb-6">
            Mental health studies show that consistent journaling can lead to reduced stress, improved mood, and greater self-awareness.
          </p>
        </div>
      </motion.div>
      
      {/* Fixed Continue Button */}
      <motion.div 
        className="continue-button-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button
          onClick={onContinue}
          type="button"
          className="w-full bg-lucid-dark text-lucid-cream py-3 rounded-full font-medium text-lg"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

export default DidYouKnowSlide; 