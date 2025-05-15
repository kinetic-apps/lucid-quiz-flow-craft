import React, { useState, useRef, useEffect } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { motion } from 'framer-motion';

type MoodSlideProps = {
  onComplete: (mood: string) => void;
};

const MoodSlide: React.FC<MoodSlideProps> = ({ onComplete }) => {
  const [mood, setMood] = useState<string>('meh');
  const [emoji, setEmoji] = useState<string>('😐');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { goToNextStep } = useQuiz();

  // Define the moods and emojis for different positions
  const moods = [
    { position: 0, mood: 'sad', emoji: '😔' },
    { position: 25, mood: 'meh-', emoji: '🙁' },
    { position: 50, mood: 'meh', emoji: '😐' },
    { position: 75, mood: 'good', emoji: '🙂' },
    { position: 100, mood: 'great', emoji: '😀' }
  ];

  // Handle slider interaction
  const handleSliderInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    
    // Get the client X position based on whether it's a mouse or touch event
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width;
    const offsetX = clientX - rect.left;
    
    // Calculate position as percentage
    let positionPercent = (offsetX / sliderWidth) * 100;
    
    // Clamp position between 0 and 100
    positionPercent = Math.max(0, Math.min(100, positionPercent));
    
    setSliderPosition(positionPercent);
    
    // Find the closest mood based on position
    updateMoodFromPosition(positionPercent);
  };

  // Update the mood based on slider position
  const updateMoodFromPosition = (position: number) => {
    // Find the closest mood to the current position
    const closestMood = moods.reduce((prev, curr) => {
      return Math.abs(curr.position - position) < Math.abs(prev.position - position) ? curr : prev;
    });
    
    setMood(closestMood.mood);
    setEmoji(closestMood.emoji);
  };

  // Touch and mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleSliderInteraction(e as unknown as React.MouseEvent);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e);
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling while dragging
      handleSliderInteraction(e as unknown as React.TouchEvent);
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false } as AddEventListenerOptions);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Handle continue button click
  const handleContinue = () => {
    // Store the mood selection in localStorage
    localStorage.setItem('lucid_mood', mood);
    
    // Call the onComplete callback with the selected mood
    onComplete(mood);
    
    // Continue to the next step in the quiz
    goToNextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="bg-lucid-cream min-h-screen flex flex-col justify-between"
    >
      {/* Main Content */}
      <div className="flex-1 p-6 pt-12 flex flex-col">
        <div className="max-w-md w-full mx-auto flex-grow flex flex-col">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-medium font-dm-sans text-lucid-dark mb-6">
              How would you describe your current mood?
            </h1>
            
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: isDragging ? 1.05 : 1 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300,
                damping: 15,
                delay: 0.1
              }}
            >
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-xl font-medium font-dm-sans">{mood}</div>
            </motion.div>
            
            {/* Mood slider */}
            <motion.div 
              className="mt-6 relative"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4,
                delay: 0.2
              }}
            >
              <div 
                ref={sliderRef}
                className="h-12 rounded-full overflow-hidden flex cursor-pointer"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className="h-full bg-lucid-pink opacity-80 rounded-l-full" style={{ width: "20%" }}></div>
                <div className="h-full bg-lucid-pink opacity-60" style={{ width: "20%" }}></div>
                <div className="h-full bg-lucid-pink opacity-40" style={{ width: "20%" }}></div>
                <div className="h-full bg-lucid-pink opacity-20" style={{ width: "20%" }}></div>
                <div className="h-full bg-lucid-pink opacity-10 rounded-r-full" style={{ width: "20%" }}></div>
              </div>
              
              {/* Active area indicator */}
              <div 
                className="absolute h-12 bg-lucid-pink opacity-20 top-0 rounded-full pointer-events-none"
                style={{ 
                  width: `${sliderPosition}%`,
                  transition: isDragging ? 'none' : 'width 0.2s ease-out'
                }}
              />
              
              {/* Triangle indicator */}
              <motion.div 
                className="absolute w-8 h-8"
                style={{ 
                  left: `calc(${sliderPosition}% - 16px)`,
                  top: '100%',
                  transform: 'translateY(-50%)',
                }}
                animate={{ 
                  x: 0, 
                  scale: isDragging ? 1.2 : 1 
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: isDragging ? 10 : 15 
                }}
              >
                <img 
                  src="/assets/figma/mood/mood-selection-triangle.svg" 
                  alt="Slider indicator" 
                  className="w-full h-full"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* MODIFIED: Replaced button structure */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-lucid-cream z-10"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.5,
          delay: 0.6
        }}
      >
        <button
          onClick={handleContinue}
          type="button"
          className="w-full bg-lucid-dark text-lucid-cream py-4 rounded-full font-dm-sans font-semibold text-xl"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MoodSlide; 