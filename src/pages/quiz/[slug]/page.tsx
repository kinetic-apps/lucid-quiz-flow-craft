
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuiz } from '@/context/QuizContext';
import { getQuizBySlug } from '@/lib/supabase';
import QuizSlide from '@/components/quiz/QuizSlide';
import TipSlide from '@/components/quiz/TipSlide';
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
        
        // Calculate total steps (questions + tips + 1 for result)
        const totalSteps = data.questions.length + data.tips.length + 1;
        setTotalSteps(totalSteps);
        
        setLoading(false);
      } catch (err) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lucid-violet-600"></div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'Quiz not found'}
        </h1>
        <p className="text-gray-600 mb-8">
          The quiz you're looking for doesn't exist or couldn't be loaded.
        </p>
        <a 
          href="/"
          className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white px-6 py-3 rounded-md transition-colors"
        >
          Return Home
        </a>
      </div>
    );
  }

  // Determine what slide to show based on current step
  const { quiz, questions, tips } = quizData;
  const allSteps = [
    ...questions.map((q: any) => ({ type: 'question', data: q })),
    ...tips.map((t: any) => ({ type: 'tip', data: t }))
  ].sort((a, b) => a.data.order_index - b.data.order_index);

  // Add result as the final step
  allSteps.push({ type: 'result', data: { quiz_id: quiz.id } });

  // Get the current step data
  const currentStepData = allSteps[currentStep];

  // Set the gradient style from quiz data
  const gradientStyle = {
    background: `linear-gradient(to right, ${quiz.gradient_from}, ${quiz.gradient_to})`,
  };

  return (
    <div 
      className="quiz-container animate-slide-right"
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
      
      {currentStepData?.type === 'tip' && (
        <TipSlide 
          tip={currentStepData.data}
          quizId={quiz.id} 
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
