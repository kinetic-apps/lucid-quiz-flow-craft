import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence, Variants } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';

type ProgressSlideProps = {
  quizId: string;
};

// Review component
type ReviewProps = {
  name: string;
  text: string;
  visible: boolean;
};

const Review: React.FC<ReviewProps> = ({ name, text, visible }) => {
  const reviewVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: 0.2 
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={reviewVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="rounded-lg p-4 shadow-sm my-4 border border-gray-100"
        >
          <div className="flex mb-2">
            {/* 5 star rating */}
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          
          <h4 className="font-semibold text-[#383655]">{name}</h4>
          <p className="text-gray-700 text-sm">{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Dialog component
type DialogProps = {
  question: string;
  visible: boolean;
  onAnswer: (answer: boolean) => void;
};

const Dialog: React.FC<DialogProps> = ({ question, visible, onAnswer }) => {
  const dialogVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-sm w-[90%] mx-4 shadow-lg"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <p className="text-center text-sm mb-2 text-gray-500">To move forward, specify</p>
            <p className="text-center font-medium mb-8 text-lg">{question}</p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-gray-100 hover:bg-gray-200 border-0"
                onClick={() => onAnswer(false)}
              >
                No
              </Button>
              <Button
                className="flex-1 bg-[#383655] hover:bg-[#2c2a44] text-white rounded-full"
                onClick={() => onAnswer(true)}
              >
                Yes
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Progress bar component
type ProgressBarProps = {
  label: string;
  onComplete: () => void;
  delay: number;
  reviewData: { name: string; text: string };
  question: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  label, 
  onComplete, 
  delay,
  reviewData,
  question
}) => {
  const [progress, setProgress] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showReview, setShowReview] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const controls = useAnimation();

  // Start the first phase animation (0% to 50%)
  useEffect(() => {
    const startInitialAnimation = async () => {
      // Start with showing the review
      setShowReview(true);
      
      // Animate to 50%
      await controls.start({
        width: "50%",
        transition: { duration: 2, ease: "easeInOut", delay }
      });
      
      // Pause at 50% and show question
      setIsPaused(true);
      setShowQuestion(true);
    };

    startInitialAnimation();

    // Update the progress number
    const interval = setInterval(() => {
      if (isPaused && progress >= 50) {
        clearInterval(interval);
        return;
      }
      
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 50 && !isPaused) {
          setIsPaused(true);
          clearInterval(interval);
          return 50;
        }
        return Math.min(newProgress, 50);
      });
    }, 40); // 40ms * 50 = ~2 seconds to reach 50%

    return () => clearInterval(interval);
  }, [controls, delay]);

  // Handle completing the progress after question is answered
  const completeProgress = async () => {
    // Resume animation to 100%
    await controls.start({
      width: "100%",
      transition: { duration: 2, ease: "easeInOut" }
    });
    
    // Hide review after reaching 100%
    setShowReview(false);
    setIsComplete(true);
    onComplete();
  };

  // Handle question being answered
  const handleQuestionAnswer = (answer: boolean) => {
    setShowQuestion(false);
    setIsPaused(false);
    
    // Start second phase animation (50% to 100%)
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 40); // 40ms * 50 = ~2 seconds for second half
    
    completeProgress();
  };

  return (
    <div className="mb-8">
      {/* Review placed above the progress bar */}
      <Review 
        name={reviewData.name} 
        text={reviewData.text} 
        visible={showReview} 
      />
      
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-[#383655]">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <motion.div
          className="h-full bg-[#383655] rounded-full"
          initial={{ width: "0%" }}
          animate={controls}
        />
      </div>
      
      <Dialog 
        question={question} 
        visible={showQuestion} 
        onAnswer={handleQuestionAnswer} 
      />
    </div>
  );
};

// Main component
const ProgressSlide: React.FC<ProgressSlideProps> = ({ quizId }) => {
  const { goToNextStep } = useQuiz();
  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  
  // Data for each progress bar
  const progressBars = [
    {
      label: "GOALS",
      question: "Are you familiar with setting SMART goals?",
      review: {
        name: "Alex Thompson",
        text: "The goal setting framework was exactly what I needed. It helped me identify what was important and actually get things done."
      }
    },
    {
      label: "GROWTH AREAS",
      question: "Are you familiar with journaling for self-reflection?",
      review: {
        name: "Sarah Chen",
        text: "Understanding my growth areas helped me focus on what really matters. This app showed me exactly where to improve."
      }
    },
    {
      label: "PICKING CONTENT",
      question: "Do you have a regular learning routine?",
      review: {
        name: "Brian Ross",
        text: "I have been using this app for six months now. During this time, I have been able to get rid of the habit of putting everything off until the last minute."
      }
    }
  ];

  const handleBarComplete = () => {
    if (currentBarIndex < progressBars.length - 1) {
      setTimeout(() => {
        setCurrentBarIndex(currentBarIndex + 1);
      }, 1000);
    }
  };

  const allBarsCompleted = currentBarIndex >= progressBars.length - 1 && progressBars.every((_, index) => index <= currentBarIndex);

  // Container animation
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: { 
        duration: 0.3 
      }
    }
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2,
        duration: 0.5 
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.4,
        duration: 0.5 
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="p-6 h-full flex flex-col"
    >
      <motion.div variants={titleVariants} className="text-center mb-10">
        <h1 className="text-xl font-bold text-[#383655]">Creating your</h1>
        <h2 className="text-xl font-bold text-[#383655]">personalized Well-being Management plan</h2>
      </motion.div>

      <div className="flex-1 mt-2">
        {progressBars.map((bar, index) => (
          index <= currentBarIndex && (
            <ProgressBar
              key={bar.label}
              label={bar.label}
              onComplete={handleBarComplete}
              delay={index * 0.5}
              reviewData={bar.review}
              question={bar.question}
            />
          )
        ))}
      </div>

      {allBarsCompleted && (
        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          className="mt-6"
        >
          <Button
            onClick={goToNextStep}
            className="w-full bg-[#383655] hover:bg-[#2c2a44] text-white py-3 rounded-full"
          >
            Continue
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressSlide; 