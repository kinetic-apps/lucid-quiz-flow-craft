import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';

type PlanSlideProps = {
  quizId: string;
  predictedMonth?: string; // The month when improvement is expected (default: July 2025)
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

// Function to create bar variants with different delays based on index
const createBarVariants = (index: number): Variants => ({
  hidden: { scaleY: 0, originY: 1 },
  visible: {
    scaleY: 1,
    originY: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.7 + (index * 0.1)
    }
  }
});

const goalLabelVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      delay: 2.0 // Appears after bars animate
    }
  }
};

const connectorVariants: Variants = {
  hidden: { scaleY: 0, originY: 0 },
  visible: {
    scaleY: 1,
    originY: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 2.1
    }
  }
};

const PlanSlide = ({ quizId, predictedMonth = "July 2025" }: PlanSlideProps) => {
  const { goToNextStep } = useQuiz();
  const controls = useAnimation();

  // Chart data - progressive heights for bars (in pixels)
  const barHeights = [50, 70, 90, 110, 130, 145];
  const highlightBarIndex = 4; // Index of the highlighted bar
  const startMonth = "May";
  const endMonth = predictedMonth.split(" ")[0]; // Extract month from "July 2025"
  const yearText = predictedMonth.split(" ")[1] || "2025"; // Extract year or default to 2025

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="plan-slide h-full flex flex-col"
    >
      <motion.div
        className="flex flex-col p-4 h-full"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-xl font-bold text-center mb-4 text-[#383655]"
        >
          A plan designed to support your wellbeing journey
        </motion.h1>

        {/* Expected improvement text */}
        <motion.p
          variants={itemVariants}
          className="text-sm text-center mb-10"
        >
          Based on your answers, we expect you to improve your well-being by
          <br />
          <span className="font-bold text-lg text-[#383655]">{predictedMonth}</span>
        </motion.p>

        {/* Progress Chart */}
        <motion.div
          variants={itemVariants}
          className="flex-1 flex items-end justify-between gap-1 px-6 mb-1 mt-8 relative"
        >
          {/* Goal label positioned above the highlighted bar */}
          <div 
            className="absolute z-10"
            style={{
              left: `calc(${(highlightBarIndex / (barHeights.length - 1)) * 100}% - 9px)`,
              bottom: `calc(${barHeights[highlightBarIndex]}px + 20px)`
            }}
          >
            <motion.div 
              className="flex flex-col items-center"
              variants={goalLabelVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-[#383655] text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                Goal
              </div>
              <motion.div 
                className="h-6 w-1 bg-[#383655]"
                variants={connectorVariants}
                initial="hidden"
                animate="visible"
              ></motion.div>
            </motion.div>
          </div>

          {barHeights.map((height, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative">
                <div 
                  className="relative rounded-md overflow-hidden"
                  style={{ 
                    width: index === 5 ? '16px' : '18px',
                    height: `${height}px`
                  }}  
                >
                  <motion.div
                    custom={index}
                    variants={createBarVariants(index)}
                    className={`absolute bottom-0 w-full h-full ${
                      index === 0 ? "bg-red-300" :
                      index === 1 ? "bg-red-200" :
                      index === 2 ? "bg-orange-200" :
                      index === 3 ? "bg-yellow-200" :
                      index === 4 ? "bg-[#383655]" : "bg-blue-300"
                    } rounded-md`}
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Month labels */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between px-6 mb-2"
        >
          <span className="text-sm text-gray-500">{startMonth}</span>
          <span className="text-sm text-gray-500 ml-auto">{endMonth}</span>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-gray-400 text-center mt-2 mb-10"
        >
          The chart is a non-customized illustration and results may vary
        </motion.p>

        {/* Continue Button */}
        <motion.div
          variants={itemVariants}
          className="mt-auto"
        >
          <Button
            onClick={goToNextStep}
            className="w-full bg-[#383655] hover:bg-[#2c2a44] text-white py-2 rounded-full"
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PlanSlide; 