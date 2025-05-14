import React, { useEffect } from 'react';

type DidYouKnowSlideProps = {
  onContinue: () => void;
  onBack: () => void;
};

const DidYouKnowSlide = ({ onContinue, onBack }: DidYouKnowSlideProps) => {
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
    <div className="bg-lucid-cream min-h-screen flex flex-col justify-between">
      {/* Content */}
      <div className="p-6 pt-12 flex-1 flex flex-col items-center">
        {/* Lightbulb Image */}
        <div className="mb-8">
          <img 
            src="/assets/lightbulb.png" 
            alt="Lightbulb" 
            width={120}
            height={120}
          />
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h2 className="text-4xl font-medium font-dm-sans text-lucid-dark mb-4">
            Did you know?
          </h2>
          <p className="text-xl font-medium font-dm-sans text-lucid-dark mb-4">
            Journaling helps improve mental health in 60% of people
          </p>
          <p className="text-sm font-semibold font-dm-sans text-lucid-gray mb-6">
            Mental health studies show that lorem ipsum lorem ipsum...
          </p>
        </div>
      </div>
      
      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-lucid-cream z-10">
        <button
          onClick={onContinue}
          type="button"
          className="w-full bg-lucid-dark text-lucid-cream py-4 rounded-full font-dm-sans font-semibold text-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DidYouKnowSlide; 