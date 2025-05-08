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
    // Immediately complete when an age is selected
    onComplete(ageRange);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="age-select-container"
    >
      <h2 className="text-2xl font-bold text-center mb-2">What's your age?</h2>
      <p className="text-gray-600 text-center mb-6">We only use your age to personalize your plan</p>

      <div className="space-y-3">
        {ageGroups.map((ageGroup) => (
          <div
            key={ageGroup.id}
            className="p-4 border rounded-lg flex items-center cursor-pointer transition-all border-gray-200 hover:border-gray-300 hover:bg-purple-50 bg-white"
            onClick={() => handleSelectAge(ageGroup.range_text)}
          >
            <span className="text-lg">{ageGroup.range_text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AgeSelect; 