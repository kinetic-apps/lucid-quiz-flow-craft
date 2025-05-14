import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { usePostHog } from '@/context/PostHogContext';

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

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const sliderVariants: Variants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: "100%",
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.5 }
  }
};

const dotVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 25, delay: 1.3 }
  }
};

const imageVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25, delay: 0.2 }
  }
};

const statsCardVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: (custom) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      delay: 1.4 + (custom * 0.1)
    }
  })
};

const SummarySlide = ({ quizId, score, result }: SummarySlideProps) => {
  const { track } = usePostHog();
  const { goToNextStep, visitorId } = useQuiz();
  const levelInfo = getLevelInfo(score);
  const animation = useAnimation();
  
  // Calculate slider position (0-100)
  const sliderPosition = Math.min(Math.max((score / 100) * 100, 0), 100);
  
  // Determine level indicator position
  const levelIndicatorLeft = sliderPosition + '%';

  // Track when the summary slide is shown
  useEffect(() => {
    // Track summary view
    track('summary_slide_viewed', {
      visitor_id: visitorId,
      quiz_id: quizId,
      score,
      result_title: result.title
    });
    
    // Start animations
    animation.start('visible');
  }, [animation, track, visitorId, quizId, score, result.title]);

  const handleNextStep = () => {
    // Track when user clicks to continue from summary
    track('summary_continue_clicked', {
      visitor_id: visitorId,
      quiz_id: quizId,
      score,
      result_title: result.title
    });
    
    goToNextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="summary-slide bg-lucid-cream h-full flex flex-col"
    >
      <motion.div 
        className="flex flex-col p-4 h-full"
        variants={containerVariants}
        initial="hidden"
        animate={animation}
      >
        <motion.h1 
          className="text-xl font-bold mb-3 text-[#BC5867]"
          variants={itemVariants}
        >
          Summary of your Well-being Profile
        </motion.h1>
        
        {/* Negative effects level */}
        <motion.div 
          className="flex justify-between items-center mb-2"
          variants={itemVariants}
        >
          <div className="text-[#BC5867] font-medium">Negative effects level</div>
          <motion.div 
            className={`text-white text-xs px-3 py-1 rounded-full ${
              levelInfo.level === "High" ? "bg-red-400" :
              levelInfo.level === "Medium" ? "bg-orange-400" : "bg-blue-500"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 500,
              damping: 10,
              delay: 0.8
            }}
          >
            {levelInfo.level}
          </motion.div>
        </motion.div>
        
        {/* Profile image */}
        <motion.div 
          className="relative my-3 rounded-lg overflow-hidden"
          variants={itemVariants}
        >
          <motion.div
            className="w-full h-48 flex items-center justify-center"
            variants={imageVariants}
            style={{ backgroundColor: '#FBF3ED' }}
          >
            <img 
              src="/male-before-image-new.svg" 
              alt="Profile" 
              className="w-3/4 h-3/4"
            />
          </motion.div>
          
          {/* Level indicator */}
          <motion.div 
            className="absolute bottom-2 right-2 bg-[#BC5867] text-white text-xs px-3 py-1 rounded-full shadow-sm"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.3 }}
          >
            Your level
          </motion.div>
        </motion.div>
        
        {/* Level slider */}
        <motion.div 
          className="mt-2 mb-3"
          variants={itemVariants}
        >
          <div className="relative h-2 w-full rounded-full overflow-hidden">
            <motion.div 
              className="h-full w-full bg-gradient-to-r from-[#BC5867] via-yellow-300 to-red-400"
              variants={sliderVariants}
            />
            <motion.div 
              className="absolute -top-1 h-4 w-4 bg-lucid-cream border-2 border-[#BC5867] rounded-full"
              style={{ left: levelIndicatorLeft, transform: 'translateX(-50%)' }}
              variants={dotVariants}
              initial={{ top: "100%" }}
              animate={{ top: "-4px" }}
              transition={{ 
                delay: 1.3,
                duration: 0.4,
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
            />
          </div>
          <motion.div 
            className="flex justify-between mt-1 text-xs text-[#BC5867]/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.3 }}
          >
            <span>Low</span>
            <span>Normal</span>
            <span>Medium</span>
            <span>High</span>
          </motion.div>
        </motion.div>
        
        {/* Alert box */}
        <motion.div 
          className="bg-red-50/50 p-3 rounded-lg mb-3 border border-red-100"
          variants={itemVariants}
        >
          <div className="flex items-start">
            <motion.div
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <AlertCircle className="text-red-500 mr-2 w-4 h-4 flex-shrink-0 mt-0.5" />
            </motion.div>
            <div>
              <div className="font-bold text-[#BC5867] text-sm">{levelInfo.levelText}</div>
              <p className="text-xs text-[#BC5867]/80">
                High levels of negative effects can lead to constant procrastination, increased worrying, reduced energy and well-being
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={0}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-5 h-5 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">★</span>
              </div>
              <span className="text-xs text-[#BC5867]/70">Main difficulty</span>
            </div>
            <div className="font-semibold text-sm text-[#BC5867]">{levelInfo.mainDifficulty}</div>
          </motion.div>
          
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={1}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-5 h-5 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">📅</span>
              </div>
              <span className="text-xs text-[#BC5867]/70">Challenging period</span>
            </div>
            <div className="font-semibold text-sm text-[#BC5867]">{levelInfo.challengingPeriod}</div>
          </motion.div>
          
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={2}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-5 h-5 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">⚡</span>
              </div>
              <span className="text-xs text-[#BC5867]/70">Trigger</span>
            </div>
            <div className="font-semibold text-sm text-[#BC5867]">{levelInfo.trigger}</div>
          </motion.div>
          
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={3}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-5 h-5 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">🔋</span>
              </div>
              <span className="text-xs text-[#BC5867]/70">Energy level</span>
            </div>
            <div className="font-semibold text-sm text-[#BC5867]">{levelInfo.energyLevel}</div>
          </motion.div>
        </div>
        
        {/* Continue Button */}
        <motion.div
          variants={itemVariants}
          className="mt-auto"
        >
          <button
            onClick={handleNextStep}
            className="w-full py-4 px-8 rounded-full text-white font-medium text-lg"
            style={{ backgroundColor: '#BC5867' }}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SummarySlide; 