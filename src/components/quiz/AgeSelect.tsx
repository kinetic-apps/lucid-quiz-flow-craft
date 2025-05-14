import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { supabase } from '@/lib/supabase';

type AgeGroup = {
  id: string;
  range_text: string;
  display_order: number;
};

type AgeSelectProps = {
  onComplete: (ageRange: string) => void;
};

const AgeSelect = ({ onComplete }: AgeSelectProps) => {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('age_groups')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching age groups:', error);
          return;
        }

        setAgeGroups(data || []);
      } catch (err) {
        console.error('Failed to fetch age groups:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgeGroups();
  }, []);

  const handleSelectAge = (ageRange: string) => {
    setSelectedAge(ageRange);
    
    // Add a slight delay before navigating to show selection
    setTimeout(() => {
      onComplete(ageRange);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lucid-pink"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="age-select-container"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-dm-sans font-medium text-lucid-dark mb-4">What's your age?</h2>
        <p className="text-sm font-dm-sans text-lucid-gray">We only use your age to personalize your plan</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {ageGroups.map((ageGroup) => (
          <motion.div
            key={ageGroup.id}
            className={`
              border rounded-xl p-4 cursor-pointer transition-colors
              ${selectedAge === ageGroup.range_text 
                ? 'border-lucid-pink bg-lucid-pink bg-opacity-10' 
                : 'border-lucid-lightGray bg-lucid-offWhite hover:bg-gray-50'}
            `}
            onClick={() => handleSelectAge(ageGroup.range_text)}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <span className="font-lexend text-lg text-lucid-dark">{ageGroup.range_text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AgeSelect; 