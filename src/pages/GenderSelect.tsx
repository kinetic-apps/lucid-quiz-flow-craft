import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GenderSelect = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  
  const handleQuizStart = (gender: string) => {
    // Set transitioning state and selected gender
    setIsTransitioning(true);
    setSelectedGender(gender);
    
    // Clear existing data
    localStorage.removeItem('lucid_age_range');
    localStorage.removeItem('lucid_answers');
    localStorage.removeItem('lucid_progress');
    localStorage.removeItem('lucid_mood');
    
    // Set gender in localStorage
    localStorage.setItem('lucid_gender', gender);
    
    // Pre-fetch age groups to avoid loading screen
    fetch(`${window.location.origin}/api/age-groups`)
      .catch(err => console.log('Failed to pre-fetch age groups, will load on quiz page'));
    
    // Delay navigation to allow for transition animation
    setTimeout(() => {
      // This ensures our quiz loads directly to the age selection screen
      localStorage.removeItem('quiz_started');
      localStorage.removeItem('showing_did_you_know');
      // Navigate to the quiz with the preload=false parameter
      navigate('/quiz/mindfulness-assessment');
    }, 800);
  };

  return (
    <div className={`min-h-screen bg-lucid-cream flex flex-col transition-opacity duration-700 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      {/* Overlay for loading transition */}
      {isTransitioning && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-lucid-cream bg-opacity-60">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-lucid-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-lexend text-lg text-lucid-dark">
              Preparing your quiz...
            </p>
          </div>
        </div>
      )}
      
      {/* Header - Only Logo */}
      <header className="p-6">
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <img src="/assets/lucid-icon.svg" alt="Lucid Logo" className="w-full h-full" />
            </div>
            <span className="text-lucid-dark font-medium">lucid</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center p-4">
        <div className="max-w-xl w-full mx-auto">
          <div className="text-center mb-10">
            
            <p className="text-3xl font-medium font-lexend text-lucid-dark mb-4">
              IMPROVE YOUR WELL-BEING WITH OUR PERSONALIZED PLAN
            </p>
            
            <p className="text-xl font-medium font-lexend text-lucid-dark mt-4 mb-8">
              3-MINUTE QUIZ
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div 
              className={`flex flex-col border border-lucid-lightGray rounded-2xl overflow-hidden transition-all duration-300 ${selectedGender === 'male' ? 'scale-95 opacity-90' : ''} cursor-pointer`}
              onClick={() => handleQuizStart('male')}
            >
              <div className="bg-lucid-cream p-6 flex justify-center items-center">
                <img 
                  src="/assets/male-icon.svg" 
                  alt="Male" 
                  className="w-28 h-28"
                />
              </div>
              <div 
                className="bg-lucid-offWhite py-6 px-6 text-center"
              >
                <span className="font-lexend font-light text-xl text-[#2A2B2F]">Male</span>
              </div>
            </div>
            
            <div 
              className={`flex flex-col border border-lucid-lightGray rounded-2xl overflow-hidden transition-all duration-300 ${selectedGender === 'female' ? 'scale-95 opacity-90' : ''} cursor-pointer`}
              onClick={() => handleQuizStart('female')}
            >
              <div className="bg-lucid-cream p-6 flex justify-center items-center">
                <img 
                  src="/assets/female-icon.svg" 
                  alt="Female" 
                  className="w-28 h-28"
                />
              </div>
              <div 
                className="bg-lucid-offWhite py-6 px-6 text-center"
              >
                <span className="font-lexend font-light text-xl text-[#2A2B2F]">Female</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenderSelect; 