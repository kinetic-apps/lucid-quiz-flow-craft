import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { usePostHog } from '@/context/PostHogContext';
import { useParams } from 'react-router-dom';

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
  // Always set to High level to indicate need for help
  const level = "High";
  const levelText = "High level";
  const difficulties = [
    "Low energy", 
    "Procrastination", 
    "Overwhelming stress", 
    "Difficulty concentrating", 
    "Persistent sadness", 
    "Loss of interest", 
    "Sleep disturbances", 
    "Irritability", 
    "Feelings of worthlessness",
    "Social withdrawal"
  ];
  const triggers = [
    "Poor sleep quality", 
    "High-pressure work environment", 
    "Relationship conflicts", 
    "Social isolation", 
    "Financial worries", 
    "Major life changes", 
    "Chronic health issues", 
    "Lack of routine", 
    "Perfectionism",
    "Negative self-talk"
  ];
  const challengingPeriod = "Few years"; // Consistent with high negative effects
  const energyLevel = "Low"; // Consistent with high negative effects
  
  // Select one difficulty and trigger randomly from the expanded lists
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
  const levelInfo = getLevelInfo(score); // score is now effectively ignored for level determination
  const animation = useAnimation();
  const { slug } = useParams();
  let isFemale = false;
  if (slug && typeof slug === 'string') {
    isFemale = slug.toLowerCase() === 'female';
  } else {
    const storedGender = typeof window !== 'undefined' ? localStorage.getItem('lucid_gender') : null;
    isFemale = storedGender === 'female';
  }
  const profileImageSrc = isFemale ? '/images/female-sad.png' : '/male-before-image-new.svg';
  
  // Force slider position to indicate "High" (e.g., 95%)
  const sliderPosition = 95;
  
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
      className="summary-slide bg-lucid-cream h-full flex flex-col relative"
    >
      <motion.div 
        className="flex flex-col p-3 h-full pb-24 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate={animation}
      >
        <motion.h1 
          className="text-lg font-bold mb-2 text-lucid-dark"
          variants={itemVariants}
        >
          Summary of your <span className="text-[#BC5867]">Well-being Profile</span>
        </motion.h1>
        
        {/* Negative effects level */}
        <motion.div 
          className="flex justify-between items-center mb-2"
          variants={itemVariants}
        >
          <div className="text-lucid-dark font-medium text-sm">Negative effects level</div>
          <motion.div 
            className={`text-white text-xs px-2 py-0.5 rounded-full ${
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
          className="relative my-2 rounded-lg overflow-hidden"
          variants={itemVariants}
        >
          <motion.div
            className="w-full h-36 flex items-center justify-center"
            variants={imageVariants}
            style={{ backgroundColor: '#FBF3ED' }}
          >
            <img 
              src={profileImageSrc}
              alt="Profile" 
              className="w-3/4 h-3/4 object-contain"
            />
          </motion.div>
          
          {/* Level indicator */}
          <motion.div 
            className="absolute bottom-2 right-2 bg-lucid-dark text-white text-xs px-2 py-0.5 rounded-full shadow-sm"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.3 }}
          >
            Your level
          </motion.div>
        </motion.div>
        
        {/* Level slider */}
        <motion.div 
          className="mt-2 mb-2"
          variants={itemVariants}
        >
          <div className="relative h-2 w-full rounded-full overflow-hidden">
            <motion.div 
              className="h-full w-full bg-gradient-to-r from-blue-500 via-yellow-300 to-red-400"
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
            className="flex justify-between mt-1 text-xs text-lucid-dark/70"
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
          className="bg-red-50/50 p-2 rounded-lg mb-2 border border-red-100"
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
              <div className="font-bold text-[#BC5867] text-xs">{levelInfo.levelText}</div>
              <p className="text-xs text-lucid-dark/80">
                High levels of negative effects can lead to constant procrastination, increased worrying, reduced energy and well-being
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={0}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">★</span>
              </div>
              <span className="text-xs text-lucid-dark/70">Main difficulty</span>
            </div>
            <div className="font-semibold text-xs text-lucid-dark">{levelInfo.mainDifficulty}</div>
          </motion.div>
          
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={1}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">📅</span>
              </div>
              <span className="text-xs text-lucid-dark/70">Challenging period</span>
            </div>
            <div className="font-semibold text-xs text-lucid-dark">{levelInfo.challengingPeriod}</div>
          </motion.div>
          
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={2}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">⚡</span>
              </div>
              <span className="text-xs text-lucid-dark/70">Trigger</span>
            </div>
            <div className="font-semibold text-xs text-lucid-dark">{levelInfo.trigger}</div>
          </motion.div>
          
          <motion.div 
            className="bg-blue-50/30 p-2 rounded-lg border border-blue-50"
            custom={3}
            variants={statsCardVariants}
          >
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full bg-[#BC5867] flex items-center justify-center mr-1">
                <span className="text-white text-xs">🔋</span>
              </div>
              <span className="text-xs text-lucid-dark/70">Energy level</span>
            </div>
            <div className="font-semibold text-xs text-lucid-dark">{levelInfo.energyLevel}</div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Fixed continue button at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.4 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-lucid-cream z-10"
      >
        <button
          onClick={handleNextStep}
          className="w-full bg-lucid-dark text-white py-3 rounded-full font-medium text-lg flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SummarySlide; 