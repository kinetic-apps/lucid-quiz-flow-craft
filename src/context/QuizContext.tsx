import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { usePostHog } from './PostHogContext';

// Define the Window interface extension for amplitude (legacy, will be removed later)
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

export type StepType = 'question' | 'result' | 'info' | 'expert-review' | 'community' | 'summary' | 'plan' | 'progress';

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
  const [quizProgress75Fired, setQuizProgress75Fired] = useState(false);
  
  // Get PostHog context
  const { track, identify } = usePostHog();

  // Initialize visitor ID and load saved data from localStorage
  useEffect(() => {
    // Generate or retrieve visitor ID
    const storedVisitorId = localStorage.getItem('lucid_visitor_id');
    if (storedVisitorId) {
      setVisitorId(storedVisitorId);
      identify(storedVisitorId); // Identify user in PostHog
    } else {
      const newVisitorId = uuidv4();
      localStorage.setItem('lucid_visitor_id', newVisitorId);
      setVisitorId(newVisitorId);
      identify(newVisitorId); // Identify user in PostHog
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
  }, [identify]);

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
      
      // Track user age range in PostHog
      track('age_range_set', { age_range: userAgeRange });
    }
  }, [userAgeRange, track]);

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
    
    // Track question answer in PostHog
    track('question_answered', {
      step,
      question_id: question_id || `question_${step}`,
      selected_option_id,
      value: String(value)
    });
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setProgress(nextStep);
      
      // Track step navigation in PostHog
      const stepPercentage = Math.round((nextStep / totalSteps) * 100);
      track('step_navigation', {
        direction: 'next',
        from_step: currentStep,
        to_step: nextStep,
        progress_percentage: stepPercentage,
        visitor_id: visitorId,
        ...utmParams
      });
      
      // For backward compatibility, still support Amplitude if it exists
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
      
      // Fire specific PostHog events for key milestones
      if (currentStep === 0) {
        track('quiz_start', {
          visitor_id: visitorId,
          ...utmParams
        });
      }
      
      // Track progress milestones
      if (stepPercentage === 25) {
        track('quiz_progress_25_percent', { visitor_id: visitorId });
      } else if (stepPercentage === 50) {
        track('quiz_progress_50_percent', { visitor_id: visitorId });
      } else if (stepPercentage >= 75 && !quizProgress75Fired) {
        track('quiz_progress_75_percent', { visitor_id: visitorId });
        setQuizProgress75Fired(true);
      }
      
      // Track quiz completion when user reaches the final step (100%)
      if (nextStep === totalSteps - 1) {
        track('quiz_complete', {
          visitor_id: visitorId,
          total_questions: answers.length,
          ...utmParams
        });
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setProgress(prevStep);
      
      // Track step navigation in PostHog
      track('step_navigation', {
        direction: 'previous',
        from_step: currentStep,
        to_step: prevStep,
        progress_percentage: Math.round((prevStep / totalSteps) * 100),
        visitor_id: visitorId
      });

      // If user navigates back past the 75% mark, allow the event to be fired again if they reach it.
      const stepPercentage = Math.round((prevStep / totalSteps) * 100);
      if (stepPercentage < 75 && quizProgress75Fired) {
        setQuizProgress75Fired(false);
      }
    }
  };

  const resetUserAgeRange = () => {
    setUserAgeRange(null);
    localStorage.removeItem('lucid_age_range');
    
    // Track reset age range event
    track('reset_age_range', { visitor_id: visitorId });
  };

  const resetQuiz = () => {
    setAnswers([]);
    setProgress(0);
    setCurrentStep(0);
    setUserAgeRange(null);
    setQuizProgress75Fired(false); // Reset on quiz reset
    localStorage.removeItem('lucid_answers');
    localStorage.removeItem('lucid_progress');
    localStorage.removeItem('lucid_age_range');
    
    // Track quiz reset event
    track('quiz_reset', { visitor_id: visitorId });
    
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
