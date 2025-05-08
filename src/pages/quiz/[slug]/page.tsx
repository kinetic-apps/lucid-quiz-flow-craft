import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { getQuizBySlug } from '@/lib/supabase';
import QuizSlide from '@/components/quiz/QuizSlide';
import ResultGate from '@/components/quiz/ResultGate';
import { useToast } from '@/hooks/use-toast';

export default function QuizPage() {
  const { slug } = useParams();
  const { currentStep, setTotalSteps } = useQuiz();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quizData, setQuizData] = React.useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!slug) {
        setError('Quiz not found');
        setLoading(false);
        return;
      }

      try {
        const data = await getQuizBySlug(slug);
        setQuizData(data);
        
        // Calculate total steps (questions + 1 for result)
        const totalSteps = data.questions.length + 1;
        setTotalSteps(totalSteps);
        
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
  }, [slug, setTotalSteps, toast]);

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

  // Determine what slide to show based on current step
  const { quiz, questions } = quizData;
  
  // All questions as a list of steps
  const allSteps = [
    ...questions.map((q: any) => ({ type: 'question', data: q }))
  ];

  // Add result as the final step
  allSteps.push({ type: 'result', data: { quiz_id: quiz.id } });

  // Get the current step data
  const currentStepData = allSteps[currentStep];

  return (
    <div 
      className="quiz-container animate-slide-right p-4 max-w-2xl mx-auto"
      style={{ 
        '--quiz-gradient-from': quiz.gradient_from,
        '--quiz-gradient-to': quiz.gradient_to,
      } as React.CSSProperties}
    >
      {currentStepData?.type === 'question' && (
        <QuizSlide 
          question={currentStepData.data} 
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
