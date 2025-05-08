import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { getQuizBySlug, Question } from '@/lib/supabase';
import QuizSlide from '@/components/quiz/QuizSlide';
import AgeSelect from '@/components/quiz/AgeSelect';
import ResultGate from '@/components/quiz/ResultGate';
import ConfirmationSlide from '@/components/quiz/ConfirmationSlide';
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
};

type QuizData = {
  quiz: {
    id: string;
    slug: string;
    title: string;
    description: string;
    gradient_from: string;
    gradient_to: string;
    created_at: string;
  };
  questions: EnhancedQuestion[];
  tips: [];
};

type StepData = {
  question: EnhancedQuestion;
} | {
  quiz_id: string;
};

type Step = {
  type: 'question' | 'result';
  data: StepData;
};

export default function QuizPage() {
  const { slug } = useParams();
  const { currentStep, setTotalSteps, userAgeRange, setUserAgeRange, goToPrevStep } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [showAgeSelect, setShowAgeSelect] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState(0); // Separate progress state for display
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!slug) {
        setError('Quiz not found');
        setLoading(false);
        return;
      }

      try {
        const data = await getQuizBySlug(slug);
        setQuizData(data as QuizData);
        
        // Calculate total steps (questions + 1 for result)
        const totalSteps = data.questions.length + 1;
        setTotalSteps(totalSteps);
        
        // If age is already set, skip the age selection screen
        if (userAgeRange) {
          setShowAgeSelect(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Failed to load quiz');
        toast({
          title: 'Error',
          description: 'Failed to load quiz. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [slug, setTotalSteps, toast, userAgeRange]);

  // Calculate progress percentage
  useEffect(() => {
    if (!quizData) return;

    if (showAgeSelect) {
      setProgress(0); // Age selection screen is 0% progress
    } else {
      // Calculate progress based on current step relative to total questions + result
      const totalSteps = quizData.questions.length + 1;
      const currentProgress = Math.round((currentStep / totalSteps) * 100);
      setProgress(currentProgress);
    }
  }, [currentStep, quizData, showAgeSelect]);

  const handleAgeSelectComplete = (ageRange: string) => {
    setUserAgeRange(ageRange);
    setShowAgeSelect(false);
    setShowConfirmation(true); // Show confirmation slide after age selection
  };

  const handleConfirmationComplete = () => {
    setShowConfirmation(false); // Hide confirmation and proceed to questions
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            <p className="font-bold">Error</p>
            <p>Failed to load quiz. Please try again.</p>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Failed to load quiz
          </h1>
          
          <p className="text-gray-600 mb-8">
            The quiz you're looking for doesn't exist or couldn't be loaded.
          </p>
          
          <Link 
            to="/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Show age selection screen first
  if (showAgeSelect) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <AgeSelect onComplete={handleAgeSelectComplete} />
      </div>
    );
  }

  // Show confirmation slide after age selection
  if (showConfirmation) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <ConfirmationSlide onContinue={handleConfirmationComplete} />
      </div>
    );
  }

  // Determine what slide to show based on current step
  const { quiz, questions } = quizData;
    
  // All questions as a list of steps
  const allSteps: Step[] = questions.map((q) => ({ 
    type: 'question', 
    data: { question: q } 
  }));

  // Add result as the final step
  allSteps.push({ 
    type: 'result', 
    data: { quiz_id: quiz.id } 
  });

  // Get the current step data
  const currentStepData = allSteps[currentStep];

  // Handle back navigation
  const handleBackNavigation = () => {
    if (currentStep > 0) {
      goToPrevStep();
    } else {
      // If we're at the first question, go back to confirmation
      setShowConfirmation(true);
    }
  };

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
          question={'question' in currentStepData.data ? currentStepData.data.question : questions[0]} 
          quizId={quiz.id}
          stepIndex={currentStep}
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
