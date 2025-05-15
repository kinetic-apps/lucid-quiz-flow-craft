import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ConfirmationSlideProps {
  onContinue: () => void;
}

const ConfirmationSlide: React.FC<ConfirmationSlideProps> = ({ onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="bg-lucid-cream min-h-screen flex flex-col justify-between text-center"
    >
      <div className="p-6 pt-12 flex-1 max-w-sm mx-auto">
        <motion.h2 
          className="text-3xl font-semibold text-lucid-pink whitespace-nowrap"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Over 1,000,000 people
        </motion.h2>
        <motion.p 
          className="text-lucid-dark font-bold mb-8"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          have chosen Lucid
        </motion.p>
        
        <motion.div 
          className="relative my-12"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Circle visualization with profile images */}
          <div className="w-full h-64 relative">
            {/* Center circle with main profile */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-24 h-24 rounded-full bg-purple-100 border-4 border-white overflow-hidden flex items-center justify-center">
                <img src="/male-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            
            {/* Inner circle profiles */}
            <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 rotate-45">
              <div className="w-16 h-16 rounded-full bg-emerald-100 -ml-32 border-2 border-white overflow-hidden">
                <img src="/male-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-white overflow-hidden">
                <img src="/female-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute left-1/3 bottom-0 transform -translate-x-1/2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-white overflow-hidden">
                <img src="/male-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            
            {/* Outer circle profiles */}
            <div className="absolute left-1/4 top-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white overflow-hidden">
                <img src="/female-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute right-1/6 top-1/4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white overflow-hidden">
                <img src="/male-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute left-0 top-1/2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white overflow-hidden">
                <img src="/female-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute right-0 bottom-1/4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white overflow-hidden">
                <img src="/male-placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Dashed circles */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed border-amber-200 opacity-70"></div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-dashed border-amber-200 opacity-50"></div>
          </div>
        </motion.div>
        
      </div>
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-lucid-cream z-10"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.5,
          delay: 0.6
        }}
      >
        <button
          onClick={onContinue}
          type="button"
          className="w-full bg-lucid-dark text-lucid-cream py-4 rounded-full font-dm-sans font-semibold text-xl"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationSlide; 