import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { submitQuizResults, Result } from '@/lib/supabase';

type ResultGateProps = {
  quizId: string;
  quizTitle: string;
};

type QuizResult = {
  score: number;
  result: Result;
};

const ResultGate = ({ quizId, quizTitle }: ResultGateProps) => {
  const { visitorId, answers, goToPrevStep, utmParams } = useQuiz();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Submit results and get insight
      const response: QuizResult = await submitQuizResults(quizId, visitorId, answers, email, utmParams);
      
      // Show result and hide email form
      setResult(response.result);
      setScore(response.score);
      setShowEmailForm(false);
      
      // Track completion event if analytics available
      try {
        if (typeof window !== 'undefined' && 'amplitude' in window) {
          (window as any).amplitude.track('quiz_complete', { 
            visitor_id: visitorId,
            quiz_id: quizId,
            email: email,
            ...utmParams
          });
        }
      } catch (e) {
        console.error('Analytics error:', e);
      }
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Show a default result if submission fails
      setResult({
        id: '',
        quiz_id: quizId,
        title: "Something went wrong",
        description: "We're having trouble generating your personalized results. Please try again later or contact support.",
        min_score: 0,
        max_score: 0,
        created_at: new Date().toISOString()
      });
      setScore(0);
      setShowEmailForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="result-gate"
    >
      {showEmailForm ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Almost there!
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your email to receive your personalized {quizTitle} results.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? 
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span> : 
                'Get My Results'
              }
            </Button>
            
            <p className="text-xs text-gray-500 mt-2">
              We respect your privacy. Your email will never be shared.
            </p>
          </form>
          
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevStep}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="result-content">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Your {quizTitle} Results
            </h2>
            
            {result && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
                
                {score !== null && (
                  <div className="my-4 text-center">
                    <div className="inline-block p-4 bg-purple-100 rounded-full">
                      <div className="text-3xl font-bold text-purple-700">{score}</div>
                      <div className="text-sm text-purple-600">Your Score</div>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-700 mb-4">{result.description}</p>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => window.location.href = '/'}
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ResultGate;
