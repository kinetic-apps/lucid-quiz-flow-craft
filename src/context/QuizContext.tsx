import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define the Window interface extension for amplitude
declare global {
  interface Window {
    amplitude?: {
      track: (eventName: string, eventProperties: Record<string, string>) => void;
    };
  }
}

export type Answer = {
  step: number;
  value: string | boolean | number;
  question_id?: string;
  selected_option_id?: string;
};

export type StepType = 'question' | 'result' | 'info' | 'expert-review' | 'community' | 'summary';

// Define various step data types
export type QuestionStepData = {
  question: {
    id: string;
    type: string;
    text: string;
    [key: string]: unknown;
  };
};

export type InfoStepData = {
  title: string;
  content: string;
  quizId: string;
};

export type OtherStepData = {
  quizId?: string;
  quiz_id?: string;
  score?: number;
  result?: {
    title: string;
    description: string;
  };
  [key: string]: unknown;
};

export type StepData = QuestionStepData | InfoStepData | OtherStepData;

export type Step = {
  type: StepType;
  data: StepData;
};

type QuizContextType = {
  visitorId: string;
  answers: Answer[];
  progress: number;
  currentStep: number;
  userAgeRange: string | null;
  setUserAgeRange: (ageRange: string) => void;
  resetUserAgeRange: () => void;
  setAnswer: (step: number, value: string | boolean | number, question_id?: string, selected_option_id?: string) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  setTotalSteps: (steps: number) => void;
  utmParams: Record<string, string>;
  resetQuiz: () => void;
  allSteps: Step[];
  setAllSteps: (steps: Step[]) => void;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [visitorId, setVisitorId] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [userAgeRange, setUserAgeRange] = useState<string | null>(null);
  const [allSteps, setAllSteps] = useState<Step[]>([]);

  // Initialize visitor ID and load saved data from localStorage
  useEffect(() => {
    // Generate or retrieve visitor ID
    const storedVisitorId = localStorage.getItem('lucid_visitor_id');
    if (storedVisitorId) {
      setVisitorId(storedVisitorId);
    } else {
      const newVisitorId = uuidv4();
      localStorage.setItem('lucid_visitor_id', newVisitorId);
      setVisitorId(newVisitorId);
    }

    // Load saved answers and progress
    const storedAnswers = localStorage.getItem('lucid_answers');
    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers));
    }

    const storedProgress = localStorage.getItem('lucid_progress');
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
      setCurrentStep(JSON.parse(storedProgress));
    }

    // Load saved age range
    const storedAgeRange = localStorage.getItem('lucid_age_range');
    if (storedAgeRange) {
      setUserAgeRange(storedAgeRange);
    }

    // Extract and store UTM parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const utmData: Record<string, string> = {};
      ['source', 'medium', 'campaign', 'term', 'content'].forEach(param => {
        const value = urlParams.get(`utm_${param}`);
        if (value) utmData[`utm_${param}`] = value;
      });
      
      if (Object.keys(utmData).length > 0) {
        sessionStorage.setItem('lucid_utm', JSON.stringify(utmData));
        setUtmParams(utmData);
      } else {
        const storedUtm = sessionStorage.getItem('lucid_utm');
        if (storedUtm) {
          setUtmParams(JSON.parse(storedUtm));
        }
      }
    }
  }, []);

  // Save answers and progress to localStorage whenever they change
  useEffect(() => {
    if (answers.length > 0) {
      localStorage.setItem('lucid_answers', JSON.stringify(answers));
    }
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('lucid_progress', JSON.stringify(progress));
  }, [progress]);

  // Save age range to localStorage when it changes
  useEffect(() => {
    if (userAgeRange) {
      localStorage.setItem('lucid_age_range', userAgeRange);
    }
  }, [userAgeRange]);

  const setAnswer = (step: number, value: string | boolean | number, question_id?: string, selected_option_id?: string) => {
    setAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.step === step);
      
      if (existingAnswerIndex !== -1) {
        // Update existing answer
        const newAnswers = [...prev];
        newAnswers[existingAnswerIndex] = { step, value, question_id, selected_option_id };
        return newAnswers;
      } else {
        // Add new answer
        return [...prev, { step, value, question_id, selected_option_id }];
      }
    });
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setProgress(nextStep);
      
      // Fire analytics event if window.amplitude exists
      try {
        if (window.amplitude && currentStep === 0) {
          window.amplitude.track('quiz_start', { 
            visitor_id: visitorId,
            ...utmParams
          });
        }
      } catch (e) {
        console.error('Analytics error:', e);
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setProgress(prevStep);
    }
  };

  const resetUserAgeRange = () => {
    setUserAgeRange(null);
    localStorage.removeItem('lucid_age_range');
  };

  const resetQuiz = () => {
    setAnswers([]);
    setProgress(0);
    setCurrentStep(0);
    setUserAgeRange(null);
    localStorage.removeItem('lucid_answers');
    localStorage.removeItem('lucid_progress');
    localStorage.removeItem('lucid_age_range');
    // Don't reset visitor ID
  };

  const value = {
    visitorId,
    answers,
    progress,
    currentStep,
    userAgeRange,
    setUserAgeRange,
    resetUserAgeRange,
    setAnswer,
    goToNextStep,
    goToPrevStep,
    setCurrentStep,
    totalSteps,
    setTotalSteps,
    utmParams,
    resetQuiz,
    allSteps,
    setAllSteps
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
