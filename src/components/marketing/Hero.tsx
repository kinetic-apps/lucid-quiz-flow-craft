
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white py-12 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50 opacity-60" />
      <div 
        className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
      />
      
      <div className="container relative max-w-6xl mx-auto px-4 text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Discover Your Perfect 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-600">
            {" "}Mindfulness{" "}
          </span> 
          Practice
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Take our personalized quiz and discover the perfect mindfulness techniques 
          tailored specifically to your lifestyle, preferences, and goals.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/quiz/mindfulness">
            <Button className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white text-lg px-8 py-6 h-auto rounded-lg">
              Start Your Free Quiz
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Takes only 2 minutes • No sign-up required
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-16 md:mt-24 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg mx-auto">
            <div className="p-1 bg-gradient-to-r from-violet-400 to-purple-500" />
            <div className="p-6">
              <img 
                src="/placeholder.svg" 
                alt="Quiz Preview" 
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
