import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface WellbeingChartProps {
  onContinue?: () => void;
}

const WellbeingChart = ({ onContinue }: WellbeingChartProps = {}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  
  // Updated y-coordinates so all points are colinear, giving a perfectly straight line
  const weeks = [
    { id: 1, label: 'WEEK 1', x: '20%', y: '80%' },  // Starting point
    { id: 2, label: 'WEEK 2', x: '40%', y: '59.333%' },  // Exact linear interpolation
    { id: 3, label: 'WEEK 3', x: '60%', y: '38.667%' },  // Exact linear interpolation
    { id: 4, label: 'WEEK 4', x: '80%', y: '18%' },  // End point
  ];

  // Update chart dimensions when component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setChartDimensions({
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight
        });
      }
    };

    // Initial calculation
    updateDimensions();
    
    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Convert percentage-based coordinates to absolute pixel values without rounding to preserve
  // sub-pixel precision (helps the SVG line align exactly with the visual dot centers).
  const getAbsoluteCoordinates = (percentage: string, dimension: number) => {
    return (parseFloat(percentage) / 100) * dimension;
  };

  // Generate the path when dimensions are available
  const generateStraightLinePath = () => {
    if (chartDimensions.width === 0 || chartDimensions.height === 0) return '';
    
    const points = weeks.map(week => ({
      x: getAbsoluteCoordinates(week.x, chartDimensions.width),
      y: getAbsoluteCoordinates(week.y, chartDimensions.height)
    }));
    
    return `M ${points[0].x} ${points[0].y} 
            L ${points[1].x} ${points[1].y} 
            L ${points[2].x} ${points[2].y} 
            L ${points[3].x} ${points[3].y}`;
  };

  const straightLinePath = generateStraightLinePath();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.7 }}
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-6 pb-24"
    >
      <h2 className="text-2xl font-semibold text-center mb-2 text-[#BC5867]">Your Well-being level</h2>
      
      <div 
        ref={chartRef}
        className="relative w-full h-60 sm:h-64 md:h-72 mt-4 mb-6 sm:mb-8 rounded-lg"
      >
        {/* Chart background zones - lighter purple gradient */}
        <div className="absolute inset-0 grid grid-cols-4 gap-0">
          <div className="bg-pink-50/30 rounded-l-lg"></div>
          <div className="bg-yellow-50/20"></div>
          <div className="bg-green-50/20"></div>
          <div className="bg-purple-50/20 rounded-r-lg"></div>
        </div>
        
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6">
          {[1, 2, 3, 4].map((line) => (
            <div key={line} className="w-full border-t border-gray-200 border-dashed"></div>
          ))}
        </div>
        
        {/* Vertical grid lines to points */}
        <div className="absolute inset-0">
          {weeks.map((week, index) => (
            <motion.div 
              key={`vline-${week.id}`}
              className="absolute border-l border-gray-200 border-dashed h-full"
              style={{ left: week.x }}
              initial={{ height: '0%' }}
              animate={{ height: '100%' }}
              transition={{ delay: 0.3 + (index * 0.2), duration: 0.5 }}
            />
          ))}
        </div>
        
        {/* Connection lines from dots to horizontal axis */}
        {weeks.map((week, index) => (
          <motion.div
            key={`connection-${week.id}`}
            className="absolute border-l border-gray-200"
            style={{ 
              left: week.x,
              top: week.y,
              height: `calc(100% - ${week.y})`,
              transform: 'translateX(-50%)'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `calc(100% - ${week.y})`, opacity: 0.6 }}
            transition={{ delay: 1 + (index * 0.3), duration: 0.5 }}
          />
        ))}
        
        {/* Dots on the curve */}
        {weeks.map((week, index) => (
          <motion.div
            key={week.id}
            className={`absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center
              ${index === 0 ? 'bg-pink-400' : 
                index === 1 ? 'bg-orange-400' : 
                index === 2 ? 'bg-yellow-400' : 'bg-[#BC5867]'}`}
            style={{ 
              left: week.x, 
              top: week.y,
              transform: 'translate(-50%, -50%)' 
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + (index * 0.3), duration: 0.5 }}
          />
        ))}
        
        {/* The connecting line that appears after all points - STRAIGHT LINE VERSION */}
        {chartDimensions.width > 0 && (
          <motion.svg
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f472b6" /> {/* Pink */}
                <stop offset="35%" stopColor="#fb923c" /> {/* Orange */}
                <stop offset="65%" stopColor="#facc15" /> {/* Yellow */}
                <stop offset="100%" stopColor="#BC5867" /> {/* New theme color */}
              </linearGradient>
            </defs>
            <motion.path
              d={straightLinePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="miter"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 2.2, duration: 1, ease: "easeInOut" }}
            />
          </motion.svg>
        )}
        
        {/* Today indicator */}
        <motion.div
          className="absolute bg-pink-400 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
          style={{ 
            left: weeks[0].x, 
            top: `calc(${weeks[0].y} - 25px)`,
            transform: 'translate(-50%, -50%)' 
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          Today
        </motion.div>
        
        {/* After using Lucid indicator */}
        <motion.div
          className="absolute bg-[#BC5867] text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm whitespace-nowrap"
          style={{ 
            left: weeks[3].x, 
            top: `calc(${weeks[3].y} - 25px)`,
            transform: 'translate(-50%, -50%)' 
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          After using Lucid
        </motion.div>
        
        {/* Week labels */}
        <div className="absolute w-full bottom-0 flex justify-between px-4 text-xs text-gray-600">
          {weeks.map((week) => (
            <div key={week.id} className="flex flex-col items-center">
              <div className="w-1 h-3 bg-gray-300 mb-1"></div>
              {week.label}
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        The chart is a non-customized illustration and results may vary
      </p>
      
      <div className="text-center mt-4 sm:mt-6">
        <h2 className="text-xl font-semibold text-[#BC5867]">Your personal</h2>
        <h1 className="text-2xl font-bold text-[#BC5867] mb-1">Well-being Management Plan</h1>
        <p className="text-lg">is ready!</p>
      </div>
      
      {/* Fixed continue button at bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-lucid-cream z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.5 }}
      >
        <button
          onClick={handleContinue}
          className="w-full bg-lucid-dark text-white py-4 rounded-full font-medium text-lg flex items-center justify-center"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default WellbeingChart; 