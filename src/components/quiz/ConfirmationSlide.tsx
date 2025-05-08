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
      className="flex flex-col items-center justify-center h-full text-center"
    >
      <div className="p-4 max-w-sm mx-auto">
        <h2 className="text-3xl font-semibold text-emerald-600 whitespace-nowrap">
          Over 1,000,000 people
        </h2>
        <p className="text-gray-900 font-bold mb-8">have chosen Lucid</p>
        
        <div className="relative my-12">
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
        </div>
        
        <Button 
          onClick={onContinue}
          className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-full"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default ConfirmationSlide; 