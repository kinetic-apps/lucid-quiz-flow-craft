import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MoodSelect: React.FC = () => {
  const [mood, setMood] = useState<string>('meh');
  const [emoji, setEmoji] = useState<string>('😐');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Define the moods and emojis for different positions
  const moods = [
    { position: 0, mood: 'sad', emoji: '😔' },
    { position: 25, mood: 'not good', emoji: '🙁' },
    { position: 50, mood: 'meh', emoji: '😐' },
    { position: 75, mood: 'good', emoji: '🙂' },
    { position: 100, mood: 'great', emoji: '😀' }
  ];

  // Handle slider interaction
  const handleSliderInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width;
    const offsetX = clientX - rect.left;
    let positionPercent = (offsetX / sliderWidth) * 100;
    positionPercent = Math.max(0, Math.min(100, positionPercent));
    setSliderPosition(positionPercent);
    updateMoodFromPosition(positionPercent);
  };

  const updateMoodFromPosition = (position: number) => {
    const closestMood = moods.reduce((prev, curr) => {
      return Math.abs(curr.position - position) < Math.abs(prev.position - position) ? curr : prev;
    });
    setMood(closestMood.mood);
    setEmoji(closestMood.emoji);
  };

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
      e.preventDefault();
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

  const handleContinue = () => {
    localStorage.setItem('lucid_mood', mood);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-lucid-cream flex flex-col">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col"
      >
        {/* Header */}
        <header className="p-4 relative">
          <div className="absolute left-4 top-4">
            <button onClick={() => navigate(-1)} className="text-lucid-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <img src="/assets/lucid-icon.svg" alt="Lucid Logo" className="w-full h-full" />
              </div>
              <span className="text-lucid-dark font-medium">lucid</span>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-grow flex flex-col justify-between p-4 pt-8">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-2xl font-medium text-lucid-dark mb-6">
                How would you describe your current mood?
              </h1>
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">{emoji}</div>
                <div className="text-xl font-medium">{mood}</div>
              </div>
              {/* Mood slider */}
              <div className="mt-6 relative">
                {/* Added a larger touch target wrapper */}
                <div 
                  className="py-12 cursor-pointer"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <div 
                    ref={sliderRef}
                    className="h-12 rounded-full overflow-hidden flex"
                  >
                    <div className="h-full bg-lucid-pink opacity-80 rounded-l-full" style={{ width: "20%" }}></div>
                    <div className="h-full bg-lucid-pink opacity-60" style={{ width: "20%" }}></div>
                    <div className="h-full bg-lucid-pink opacity-40" style={{ width: "20%" }}></div>
                    <div className="h-full bg-lucid-pink opacity-20" style={{ width: "20%" }}></div>
                    <div className="h-full bg-lucid-pink opacity-10 rounded-r-full" style={{ width: "20%" }}></div>
                  </div>
                  {/* Active area indicator */}
                  <div 
                    className="absolute h-12 bg-lucid-pink opacity-20 top-12 rounded-full pointer-events-none"
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
                      top: 'calc(100% - 18px)',
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
                </div>
              </div>
            </div>
            {/* Continue Button (not fixed) */}
            <button
              onClick={handleContinue}
              type="button"
              className="w-full bg-lucid-dark text-lucid-cream py-4 rounded-full font-semibold text-xl mt-8"
            >
              Continue
            </button>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default MoodSelect; 