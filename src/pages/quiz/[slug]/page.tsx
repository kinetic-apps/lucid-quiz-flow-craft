import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { getQuizBySlug, Question, submitQuizResults } from '@/lib/supabase';
import QuizSlide from '@/components/quiz/QuizSlide';
import AgeSelect from '@/components/quiz/AgeSelect';
import ResultGate from '@/components/quiz/ResultGate';
import ConfirmationSlide from '@/components/quiz/ConfirmationSlide';
import InfoSlide from '@/components/quiz/InfoSlide';
import ExpertReviewSlide from '@/components/quiz/ExpertReviewSlide';
import CommunitySlide from '@/components/quiz/CommunitySlide';
import SummarySlide from '@/components/quiz/SummarySlide';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
};

type Step = {
  type: 'question' | 'result' | 'info' | 'expert-review' | 'community' | 'summary';
  data: StepData;
};

export default function QuizPage() {
  const { slug } = useParams();
  const { currentStep, setTotalSteps, userAgeRange, setUserAgeRange, goToPrevStep, answers } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [showAgeSelect, setShowAgeSelect] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState(0); // Separate progress state for display
  const [allSteps, setAllSteps] = useState<Step[]>([]); // Store steps in state to avoid recreation
  const [summaryScoreCalculated, setSummaryScoreCalculated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          // Adding 5 for: 1) info slide, 2) expert review, 3) community, 4) summary, 5) result
          const totalSteps = data.questions.length + 5;
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

    // Add result as the final step
    steps.push({ 
      type: 'result', 
      data: { quiz_id: quiz.id } 
    });
    
    setAllSteps(steps);
  }, [quizData]);

  // Calculate score for summary - now using the allSteps state
  useEffect(() => {
    if (!quizData || !allSteps.length) return;
    
    const { quiz } = quizData;
    const currentStepData = allSteps[currentStep];
    
    // Check if current step is the summary slide and we have answers
    if (currentStepData?.type === 'summary' && answers && answers.length > 0 && !summaryScoreCalculated) {
      const calculateScore = async () => {
        try {
          // Use submitQuizResults to calculate the score but don't actually submit
          const result = await submitQuizResults(
            quiz.id,
            'temp-id', // Temporary ID since we're not actually submitting
            answers,
            undefined, // No email
            {}, // No UTM params
            userAgeRange
          );
          
          // Update the summary step data with the calculated score and result
          if (result && currentStepData.type === 'summary' && 'score' in currentStepData.data) {
            // Create a new steps array with the updated score
            const updatedSteps = [...allSteps];
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
            
            setAllSteps(updatedSteps);
            setSummaryScoreCalculated(true);
          }
        } catch (error) {
          console.error('Error calculating score:', error);
        }
      };
      
      calculateScore();
    }
  }, [currentStep, allSteps, quizData, answers, userAgeRange, summaryScoreCalculated]);

  // Reset summaryScoreCalculated when step changes away from summary
  useEffect(() => {
    const currentStepData = allSteps[currentStep];
    if (currentStepData?.type !== 'summary') {
      setSummaryScoreCalculated(false);
    }
  }, [currentStep, allSteps]);

  if (loading) {
    return <div className="p-4 max-w-md mx-auto">Loading quiz...</div>;
  }

  if (error) {
    return <div className="p-4 max-w-md mx-auto">Error: {error}</div>;
  }

  if (!quizData) {
    return <div className="p-4 max-w-md mx-auto">No quiz data available.</div>;
  }

  if (showAgeSelect) {
    return (
      <AgeSelect 
        onComplete={(range) => {
          setUserAgeRange(range);
          setShowAgeSelect(false);
        }} 
      />
    );
  }

  if (showConfirmation) {
    return (
      <ConfirmationSlide 
        onContinue={() => setShowConfirmation(false)} 
      />
    );
  }

  const { quiz } = quizData;
  const currentStepData = allSteps[currentStep];

  return (
    <div 
      className="quiz-container animate-slide-right p-4 max-w-md mx-auto"
      style={{ 
        '--quiz-gradient-from': quiz.gradient_from,
        '--quiz-gradient-to': quiz.gradient_to,
      } as React.CSSProperties}
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
      
      {currentStepData?.type === 'summary' && 'score' in currentStepData.data && 'result' in currentStepData.data && (
        <SummarySlide 
          quizId={quiz.id}
          score={currentStepData.data.score}
          result={currentStepData.data.result}
        />
      )}
      
      {currentStepData?.type === 'result' && (
        <ResultGate 
          quizId={quiz.id}
          quizTitle={quiz.title}
        />
      )}
    </div>
  );
}
