import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { getQuizBySlug, Question, submitQuizResults } from '@/lib/supabase';
import QuizSlide from '@/components/quiz/QuizSlide';
import AgeSelect from '@/components/quiz/AgeSelect';
import DidYouKnowSlide from '@/components/quiz/DidYouKnowSlide';
import ResultGate from '@/components/quiz/ResultGate';
import ConfirmationSlide from '@/components/quiz/ConfirmationSlide';
import InfoSlide from '@/components/quiz/InfoSlide';
import ExpertReviewSlide from '@/components/quiz/ExpertReviewSlide';
import CommunitySlide from '@/components/quiz/CommunitySlide';
import MoodSlide from '@/components/quiz/MoodSlide';
import SummarySlide from '@/components/quiz/SummarySlide';
import PlanSlide from '@/components/quiz/PlanSlide';
import ProgressSlide from '@/components/quiz/ProgressSlide';
import TipSlide from '@/components/quiz/TipSlide';
import WellbeingChart from '@/components/quiz/WellbeingChart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Step as QuizStep } from '@/context/QuizContext';
import { useMobileScrollLock } from '@/hooks/use-mobile-scroll-lock';
import { motion, AnimatePresence } from 'framer-motion';

// Define types for better type safety
type QuestionOption = {
  id: string;
  text: string;
  value: number;
  order_number: number;
};

type EnhancedQuestion = Question & {
  type: 'radio' | 'boolean' | 'likert';
  options: string[];
  optionsData: QuestionOption[];
  options_array: {
    id: string;
    text: string;
    value: number;
    is_correct?: boolean;
  }[];
  savedUserAnswer?: string;
};

type Quiz = {
  id: string;
  title: string;
  slug: string;
  gradient_from: string;
  gradient_to: string;
  created_at: string;
  // Add any other properties from the quiz object
};

type QuizData = {
  quiz: Quiz;
  questions: EnhancedQuestion[];
  tips?: unknown[]; // Use unknown instead of any
};

type StepData = {
  question: EnhancedQuestion;
} | {
  quiz_id: string;
} | {
  title: string;
  content: string;
  quizId: string;
} | {
  quizId: string;
} | {
  quizId: string;
  score: number;
  result: {
    title: string;
    description: string;
  };
} | {
  quizId: string;
  predictedMonth: string;
};

// Using our own Step type here to avoid conflicts with QuizStep
type Step = {
  type: 'question' | 'result' | 'info' | 'expert-review' | 'community' | 'mood' | 'summary' | 'plan' | 'progress' | 'wellbeing-chart';
  data: StepData;
};

// Create a direct WellbeingChartSlide component that bypasses ResultGate
const WellbeingChartSlide = ({ quizId }: { quizId: string }) => {
  const navigate = useNavigate();
  
  const handleContinue = () => {
    navigate('/checkout');
  };
  
  return <WellbeingChart onContinue={handleContinue} />;
};

export default function QuizPage() {
  const { slug } = useParams();
  const { currentStep, setTotalSteps, userAgeRange, setUserAgeRange, goToPrevStep, answers, setAllSteps, allSteps, visitorId } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [showAgeSelect, setShowAgeSelect] = useState(true);
  const [showDidYouKnow, setShowDidYouKnow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState(0); // Separate progress state for display
  const [localSteps, setLocalSteps] = useState<Step[]>([]); // Renamed to avoid confusion with context
  const [summaryScoreCalculated, setSummaryScoreCalculated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Prevent scrolling on the quiz page as all content fits within the viewport
  useMobileScrollLock({ allowScroll: false });

  // Listen for back navigation events from the ProgressBar component
  useEffect(() => {
    const handleBackNavigation = (event: CustomEvent) => {
      const screen = event.detail?.screen;
      
      switch (screen) {
        case 'age-select':
          // Navigate from age selection back to gender selection
          navigate('/');
          break;
          
        case 'did-you-know':
          // Navigate from Did You Know slide back to Age Select
          setShowDidYouKnow(false);
          setShowAgeSelect(true);
          localStorage.removeItem('showing_did_you_know');
          break;
          
        case 'confirmation':
          // Navigate from Confirmation slide back to Did You Know
          setShowConfirmation(false);
          setShowDidYouKnow(true);
          localStorage.setItem('showing_did_you_know', 'true');
          break;
          
        case 'first-question':
          // Navigate from first question back to confirmation
          setShowConfirmation(true);
          localStorage.removeItem('quiz_started');
          break;
          
        default:
          // Default fallback
          if (currentStep > 0) {
            goToPrevStep();
          } else {
            navigate('/');
          }
      }
    };
    
    // Add event listener for back navigation
    window.addEventListener('quiz-back-navigation', handleBackNavigation as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('quiz-back-navigation', handleBackNavigation as EventListener);
    };
  }, [currentStep, goToPrevStep, navigate, setShowAgeSelect, setShowConfirmation, setShowDidYouKnow]);

  // Fetch quiz data
  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setError(null);
      
      if (!slug) {
        setError("No quiz slug provided");
        setLoading(false);
        return;
      }
      
      try {
        const data = await getQuizBySlug(slug);
        if (data) {
          setQuizData(data);
          
          // Set the total number of steps (questions + special slides + summary + result)
          // Adding 8 for: 1) info slide, 2) expert review, 3) community, 4) mood, 5) summary, 6) plan, 7) progress, 8) result
          const totalSteps = data.questions.length + 8;
          setTotalSteps(totalSteps);
        } else {
          setError("Quiz not found");
        }
      } catch (error) {
        setError("Error loading quiz");
        console.error(error);
      }
      
      setLoading(false);
    }
    
    fetchQuiz();
  }, [slug, setTotalSteps]);

  // Build all steps whenever quizData changes
  useEffect(() => {
    if (!quizData) return;
    
    const { quiz, questions } = quizData;
    const steps: Step[] = [];
    
    // Add the mood slide as the first step in the quiz
    steps.push({
      type: 'mood',
      data: { 
        quizId: quiz.id 
      }
    });
    
    // Add all questions, inserting special slides at specific positions
    questions.forEach((q, index) => {
      steps.push({
        type: 'question',
        data: { question: q }
      });
      
      // Insert the info slide after question 23 (index 22 because of zero-indexing)
      if (index === 22) {
        steps.push({
          type: 'info',
          data: {
            title: 'Evidence-Based Approach',
            content: 'Lucid is developed using evidence-based psychological practices, drawing on research from leading academic institutions.',
            quizId: quiz.id
          }
        });
      }
      
      // Insert the expert review slide after question 25 (index 24 because of zero-indexing)
      if (index === 24) {
        steps.push({
          type: 'expert-review',
          data: { 
            quizId: quiz.id 
          }
        });
        
        // Insert the community slide immediately after the expert review slide
        steps.push({
          type: 'community',
          data: { 
            quizId: quiz.id 
          }
        });
      }
    });
    
    // Add summary slide before the final result
    steps.push({
      type: 'summary',
      data: {
        quizId: quiz.id,
        score: 60, // Default score to start with
        result: {
          title: "Productivity Assessment",
          description: "Your personalized assessment is ready."
        }
      }
    });

    // Add plan slide after summary
    steps.push({
      type: 'plan',
      data: {
        quizId: quiz.id,
        predictedMonth: "July 2025" // Default predicted month
      }
    });
    
    // Add progress slide after plan slide
    steps.push({
      type: 'progress',
      data: {
        quizId: quiz.id
      }
    });

    // Replace the result step with a direct wellbeing chart step to avoid ResultGate
    steps.push({ 
      type: 'wellbeing-chart', 
      data: { quizId: quiz.id } 
    });
    
    setLocalSteps(steps);
    setAllSteps(steps as QuizStep[]); // Cast to QuizStep type when updating context
  }, [quizData, setAllSteps]);

  // Calculate score for summary - now using the allSteps state
  useEffect(() => {
    if (!quizData || !localSteps.length) return;
    
    const { quiz } = quizData;
    const currentStepData = localSteps[currentStep];
    
    // Check if current step is the summary slide and we have answers
    if (currentStepData?.type === 'summary' && answers && answers.length > 0 && !summaryScoreCalculated) {
      const calculateScore = async () => {
        try {
          // Only try to calculate if we have real answers
          if (answers.length === 0) {
            return;
          }

          // Use visitor ID instead of "temp-id" for proper UUID format
          const result = await submitQuizResults(
            quiz.id,
            visitorId, // Use the actual visitor ID which is a valid UUID
            answers,
            undefined, // No email
            {}, // No UTM params
            userAgeRange
          );
          
          // Update the summary step data with the calculated score and result
          if (result && currentStepData.type === 'summary' && 'score' in currentStepData.data) {
            // Create a new steps array with the updated score
            const updatedSteps = [...localSteps];
            updatedSteps[currentStep] = {
              ...updatedSteps[currentStep],
              data: {
                ...updatedSteps[currentStep].data,
                score: result.score || 60,
                result: result.result || {
                  title: "Productivity Assessment",
                  description: "Your personalized assessment is ready."
                }
              }
            };
            
            // Use a setTimeout to avoid updating state during rendering
            setTimeout(() => {
              setLocalSteps(updatedSteps);
              setAllSteps(updatedSteps as QuizStep[]);
              setSummaryScoreCalculated(true);
            }, 0);
          }
        } catch (error) {
          console.error('Error calculating score:', error);
          
          // Even if there's an error, set a default score and result
          if (currentStepData.type === 'summary' && 'score' in currentStepData.data) {
            const updatedSteps = [...localSteps];
            updatedSteps[currentStep] = {
              ...updatedSteps[currentStep],
              data: {
                ...updatedSteps[currentStep].data,
                score: 60,
                result: {
                  title: "Productivity Assessment",
                  description: "Your personalized assessment is ready."
                }
              }
            };
            
            // Use a setTimeout to avoid updating state during rendering
            setTimeout(() => {
              setLocalSteps(updatedSteps);
              setAllSteps(updatedSteps as QuizStep[]);
              setSummaryScoreCalculated(true);
            }, 0);
          }
        }
      };
      
      calculateScore();
    }
  }, [currentStep, quizData, answers, userAgeRange, summaryScoreCalculated, visitorId]);

  // Reset summaryScoreCalculated when step changes away from summary
  useEffect(() => {
    const currentStepData = localSteps[currentStep];
    if (currentStepData?.type !== 'summary') {
      setSummaryScoreCalculated(false);
    }
  }, [currentStep, localSteps]);

  // Handle age selection
  const handleAgeSelection = (ageRange: string) => {
    setUserAgeRange(ageRange);
    localStorage.setItem('lucid_age_range', ageRange);
    
    // Clear any existing quiz state
    localStorage.removeItem('quiz_started');
    
    // Show the "Did You Know" slide after age selection
    setShowAgeSelect(false);
    setShowDidYouKnow(true);
    
    // Set flag to hide progress bar
    localStorage.setItem('showing_did_you_know', 'true');
  };

  // Handle continuing from the "Did You Know" slide
  const handleDidYouKnowContinue = () => {
    setShowDidYouKnow(false);
    setShowConfirmation(true);
    
    // Remove flag to show progress bar again
    localStorage.removeItem('showing_did_you_know');
  };
  
  // Handle mood selection
  const handleMoodSelection = (mood: string) => {
    localStorage.setItem('lucid_mood', mood);
    // No need to navigate or change state as the quiz flow handles this automatically
  };

  if (loading) {
    // Skip loading display if we're coming directly from gender selection 
    // and just showing the age selection screen
    const comingFromGenderSelect = !localStorage.getItem('quiz_started') && 
                                   !localStorage.getItem('showing_did_you_know') && 
                                   localStorage.getItem('lucid_gender');
    
    if (comingFromGenderSelect) {
      // If we're coming from gender select, immediately show age select
      return <AgeSelect onComplete={handleAgeSelection} />;
    }
    
    return <div className="p-4 max-w-md mx-auto">Loading quiz...</div>;
  }

  if (error) {
    return <div className="p-4 max-w-md mx-auto">Error: {error}</div>;
  }

  if (!quizData) {
    return <div className="p-4 max-w-md mx-auto">No quiz data available.</div>;
  }

  if (showAgeSelect) {
    return <AgeSelect onComplete={handleAgeSelection} />;
  }

  if (showDidYouKnow) {
    return <DidYouKnowSlide onContinue={handleDidYouKnowContinue} />;
  }

  if (showConfirmation) {
    return (
      <ConfirmationSlide 
        onContinue={() => {
          setShowConfirmation(false);
          // Ensure quiz is marked as started for progress bar
          localStorage.setItem('quiz_started', 'true');
        }} 
      />
    );
  }

  const { quiz } = quizData;
  const currentStepData = localSteps[currentStep];

  return (
    <div 
      className="quiz-container animate-slide-left h-full p-2 max-w-md mx-auto flex flex-col"
      style={{ 
        '--quiz-gradient-from': quiz.gradient_from,
        '--quiz-gradient-to': quiz.gradient_to,
      } as React.CSSProperties}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          {currentStepData?.type === 'question' && (
            <QuizSlide 
              question={'question' in currentStepData.data ? currentStepData.data.question : quizData.questions[0]} 
              quizId={quiz.id}
              stepIndex={currentStep}
            />
          )}
          {currentStepData?.type === 'info' && (
            <InfoSlide 
              title={'title' in currentStepData.data ? currentStepData.data.title : 'Evidence-Based Approach'}
              content={'content' in currentStepData.data ? currentStepData.data.content : 'Lucid is developed using evidence-based psychological practices.'}
              quizId={quiz.id}
            />
          )}
          {currentStepData?.type === 'expert-review' && (
            <ExpertReviewSlide 
              quizId={quiz.id}
            />
          )}
          {currentStepData?.type === 'community' && (
            <CommunitySlide 
              quizId={quiz.id}
            />
          )}
          {currentStepData?.type === 'mood' && (
            <MoodSlide 
              onComplete={handleMoodSelection}
            />
          )}
          {currentStepData?.type === 'summary' && 'score' in currentStepData.data && 'result' in currentStepData.data && (
            <SummarySlide 
              quizId={quiz.id}
              score={currentStepData.data.score}
              result={currentStepData.data.result}
            />
          )}
          {currentStepData?.type === 'plan' && 'quizId' in currentStepData.data && (
            <PlanSlide 
              quizId={currentStepData.data.quizId}
              predictedMonth={
                'predictedMonth' in currentStepData.data 
                  ? String(currentStepData.data.predictedMonth) 
                  : "July 2025"
              }
            />
          )}
          {currentStepData?.type === 'progress' && 'quizId' in currentStepData.data && (
            <ProgressSlide 
              quizId={currentStepData.data.quizId}
            />
          )}
          {currentStepData?.type === 'wellbeing-chart' && 'quizId' in currentStepData.data && (
            <WellbeingChartSlide 
              quizId={currentStepData.data.quizId}
            />
          )}
          {currentStepData?.type === 'result' && (
            <ResultGate 
              quizId={quiz.id}
              quizTitle={quiz.title}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
