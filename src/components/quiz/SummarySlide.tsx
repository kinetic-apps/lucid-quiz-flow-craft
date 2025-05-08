import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type SummarySlideProps = {
  quizId: string;
  score: number;
  result: {
    title: string;
    description: string;
  };
};

// Helper function to determine the level and category
const getLevelInfo = (score: number) => {
  let level;
  let levelText;
  let difficulties: string[] = [];
  let triggers: string[] = [];
  let challengingPeriod = "Few years";
  let energyLevel = "Low";
  
  if (score <= 40) {
    level = "High";
    levelText = "High level";
    difficulties = ["Low energy", "Procrastination", "Stress"];
    triggers = ["Sleep", "Work environment", "Anxiety"];
  } else if (score <= 70) {
    level = "Medium";
    levelText = "Medium level";
    difficulties = ["Focus issues", "Time management"];
    triggers = ["Technology distractions", "Poor habits"];
    challengingPeriod = "Several months";
    energyLevel = "Medium";
  } else {
    level = "Low";
    levelText = "Low level";
    difficulties = ["Occasional stress", "Work-life balance"];
    triggers = ["Temporary setbacks"];
    challengingPeriod = "Few weeks";
    energyLevel = "High";
  }
  
  // Select one difficulty and trigger randomly
  const mainDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const trigger = triggers[Math.floor(Math.random() * triggers.length)];
  
  return {
    level,
    levelText,
    mainDifficulty,
    trigger,
    challengingPeriod,
    energyLevel
  };
};

const SummarySlide = ({ quizId, score, result }: SummarySlideProps) => {
  const { goToNextStep } = useQuiz();
  const levelInfo = getLevelInfo(score);
  
  // Calculate slider position (0-100)
  const sliderPosition = Math.min(Math.max((score / 100) * 100, 0), 100);
  
  // Determine level indicator position
  const levelIndicatorLeft = sliderPosition + '%';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="summary-slide bg-gray-50 h-full flex flex-col"
    >
      <div className="flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-6">Summary of your Well-being Profile</h1>
        
        {/* Negative effects level */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-gray-800 font-medium">Negative effects level</div>
          <div className={`text-white text-xs px-3 py-1 rounded-full ${
            levelInfo.level === "High" ? "bg-red-400" :
            levelInfo.level === "Medium" ? "bg-orange-400" : "bg-green-400"
          }`}>
            {levelInfo.level}
          </div>
        </div>
        
        {/* Profile image */}
        <div className="relative my-4 flex justify-center">
          <img 
            src="/stressed-person.png" 
            alt="Profile" 
            className="h-48 object-contain"
            onError={(e) => {
              // Fallback to a colored box if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.backgroundColor = "#4ade80";
              target.style.width = "100%";
              target.style.height = "180px";
              target.alt = "";
            }}
          />
          
          {/* Level indicator */}
          <div className="absolute bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
            Your level
          </div>
        </div>
        
        {/* Level slider */}
        <div className="mt-4 mb-6">
          <div className="relative h-2 w-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-400 rounded-full">
            <div 
              className="absolute -top-1 h-4 w-4 bg-white border-2 border-gray-300 rounded-full"
              style={{ left: levelIndicatorLeft, transform: 'translateX(-50%)' }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Low</span>
            <span>Normal</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
        
        {/* Alert box */}
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-2 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-800">{levelInfo.levelText}</div>
              <p className="text-sm text-gray-700">
                High levels of negative effects can lead to constant procrastination, increased worrying, reduced energy and well-being
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <span className="text-white text-xs">★</span>
              </div>
              <span className="text-xs text-gray-500">Main difficulty</span>
            </div>
            <div className="font-semibold">{levelInfo.mainDifficulty}</div>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <span className="text-white text-xs">📅</span>
              </div>
              <span className="text-xs text-gray-500">Challenging period</span>
            </div>
            <div className="font-semibold">{levelInfo.challengingPeriod}</div>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <span className="text-white text-xs">⚡</span>
              </div>
              <span className="text-xs text-gray-500">Trigger</span>
            </div>
            <div className="font-semibold">{levelInfo.trigger}</div>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <span className="text-white text-xs">🔋</span>
              </div>
              <span className="text-xs text-gray-500">Energy level</span>
            </div>
            <div className="font-semibold">{levelInfo.energyLevel}</div>
          </div>
        </div>
        
        {/* Continue Button */}
        <Button
          onClick={goToNextStep}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full mt-auto"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default SummarySlide; 