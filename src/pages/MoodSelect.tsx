import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MoodSelect: React.FC = () => {
  const [mood, setMood] = useState<string>('meh');
  const [emoji, setEmoji] = useState<string>('😐');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    handleSliderInteraction(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleSliderInteraction(e as unknown as React.MouseEvent);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleSliderInteraction(e);
    
    const handleTouchMove = (e: TouchEvent) => {
      handleSliderInteraction(e as unknown as React.TouchEvent);
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Handle continue button click
  const handleContinue = () => {
    // Store the mood selection in localStorage
    localStorage.setItem('lucid_mood', mood);
    
    // Navigate to the next page
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-lucid-cream flex flex-col">
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
            <h1 className="text-2xl font-medium font-dm-sans text-lucid-dark mb-6">
              How would you describe your current mood?
            </h1>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-xl font-medium font-dm-sans">{mood}</div>
            </div>
            
            {/* Mood slider */}
            <div className="mt-6 relative">
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
              
              {/* Triangle indicator */}
              <div 
                className="absolute w-8 h-8"
                style={{ 
                  left: `calc(${sliderPosition}% - 16px)`,
                  top: '100%',
                  transform: 'translateY(-50%)',
                  transition: 'left 0.1s ease-out'
                }}
              >
                <img 
                  src="/assets/figma/mood/mood-selection-triangle.svg" 
                  alt="Slider indicator" 
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="max-w-md w-full mx-auto mt-8">
          <button
            onClick={handleContinue}
            className="w-full py-4 px-8 rounded-full bg-lucid-dark text-white font-dm-sans font-semibold text-lg"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
};

export default MoodSelect; 