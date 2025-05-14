import React from 'react';
import { useNavigate } from 'react-router-dom';

const GenderSelect = () => {
  const navigate = useNavigate();
  
  const handleQuizStart = (gender: string) => {
    // Remove the age range directly from localStorage instead of using the context
    localStorage.removeItem('lucid_age_range');
    localStorage.removeItem('lucid_answers');
    localStorage.removeItem('lucid_progress');
    localStorage.removeItem('lucid_mood');
    localStorage.setItem('lucid_gender', gender);
    
    // Navigate directly to the quiz route with the correct gender slug
    navigate(`/quiz/${gender}`);
  };

  return (
    <div className="min-h-screen bg-lucid-cream flex flex-col">
      {/* Header - Only Logo */}
      <header className="p-4">
        <div className="flex justify-center items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <img src="/assets/lucid-icon.svg" alt="Lucid Logo" className="w-full h-full" />
            </div>
            <span className="text-lucid-dark font-medium">lucid</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4">
        <div className="max-w-xl w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-medium font-dm-sans text-lucid-dark mb-2">
              A PERSONALIZED WELL-BEING MANAGEMENT PLAN
            </h1>
            
            <p className="text-xl font-medium font-dm-sans text-lucid-dark mb-2">
              IMPROVE YOUR WELL-BEING WITH OUR PERSONALIZED PLAN
            </p>
            
            <p className="text-2xl font-medium font-dm-sans text-lucid-dark">
              3-MINUTE QUIZ
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex flex-col border border-lucid-lightGray rounded-2xl overflow-hidden">
              <div className="bg-lucid-cream p-6 flex justify-center items-center">
                <img 
                  src="/assets/male-icon.svg" 
                  alt="Male" 
                  className="w-28 h-28"
                />
              </div>
              <div 
                className="bg-lucid-offWhite py-6 px-6 text-center cursor-pointer"
                onClick={() => handleQuizStart('male')}
              >
                <span className="font-lexend font-light text-xl text-[#2A2B2F]">Male</span>
              </div>
            </div>
            
            <div className="flex flex-col border border-lucid-lightGray rounded-2xl overflow-hidden">
              <div className="bg-lucid-cream p-6 flex justify-center items-center">
                <img 
                  src="/assets/female-icon.svg" 
                  alt="Female" 
                  className="w-28 h-28"
                />
              </div>
              <div 
                className="bg-lucid-offWhite py-6 px-6 text-center cursor-pointer"
                onClick={() => handleQuizStart('female')}
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