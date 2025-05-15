import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ConfirmationSlideProps {
  onContinue: () => void;
}

// URLs for the public folder images - updated paths
const figmaImageUrls = {
  ellipse10: '/assets/figma/male-vector-1.svg',
  ellipse11: '/assets/figma/male-vector-2.svg',
  ellipse12: '/assets/figma/male-vector-3.svg',
  ellipse13: '/assets/figma/male-vector-4.svg',
  ellipse14: '/assets/figma/male-vector-5.svg',
  ellipse15: '/assets/figma/female-vector-1.svg',
  ellipse16: '/assets/figma/female-vector-2.svg',
  ellipse17: '/assets/figma/female-vector-3.svg',
  ellipse18: '/assets/figma/female-vector-4.svg',
  ellipse19: '/assets/figma/female-vector-5.svg',
};

// Coordinates and sizes are illustrative and will need adjustment for an exact match.
// Based on Figma structure (node 71:1073 and its children)
// For simplicity, using a subset of images and a more structured layout.
const peopleGraphic = [
  { id: 'ellipse10', src: figmaImageUrls.ellipse10, size: 'w-20 h-20', top: '35%', left: '40%', zIndex: 10 }, // Center-ish
  { id: 'ellipse11', src: figmaImageUrls.ellipse11, size: 'w-14 h-14', top: '15%', left: '25%' },
  { id: 'ellipse12', src: figmaImageUrls.ellipse12, size: 'w-14 h-14', top: '30%', left: '65%' },
  { id: 'ellipse13', src: figmaImageUrls.ellipse13, size: 'w-14 h-14', top: '60%', left: '30%' },
  { id: 'ellipse19', src: figmaImageUrls.ellipse19, size: 'w-12 h-12', top: '5%', left: '50%' },
  { id: 'ellipse14', src: figmaImageUrls.ellipse14, size: 'w-12 h-12', top: '55%', left: '60%' },
  { id: 'ellipse15', src: figmaImageUrls.ellipse15, size: 'w-12 h-12', top: '20%', left: '5%' },
];

const ConfirmationSlide: React.FC<ConfirmationSlideProps> = ({ onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="bg-lucid-cream min-h-screen flex flex-col justify-between text-center"
    >
      <div className="p-6 pt-12 flex-1 max-w-md mx-auto flex flex-col items-center">
        {/* Logo and back button would go here in a real implementation */}
        
        <motion.h2 
          className="text-[32px] font-medium text-[#191825] whitespace-nowrap font-dm-sans mt-16" 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Over 1,000,000 people
        </motion.h2>
        <motion.p 
          className="text-[20px] font-medium text-[#191825] mb-10 font-dm-sans"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          have chosen Lucid
        </motion.p>
        
        <motion.div 
          className="w-full flex justify-center items-center"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <img 
            src="/assets/image.png"
            alt="People Circles" 
            className="max-w-full h-auto" 
            style={{ background: 'transparent' }}
          />
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