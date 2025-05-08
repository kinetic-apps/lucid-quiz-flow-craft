
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-project-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Quiz = {
  id: string;
  slug: string;
  title: string;
  description: string;
  gradient_from: string;
  gradient_to: string;
  created_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  order_index: number;
  type: 'radio' | 'boolean' | 'likert';
  text: string;
  options?: string[];
  created_at: string;
};

export type Tip = {
  id: string;
  quiz_id: string;
  order_index: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
};

export type Rule = {
  id: string;
  quiz_id: string;
  condition: any; // JSON condition
  insight: string; // Markdown content
  created_at: string;
};

export type Result = {
  id: string;
  quiz_id: string;
  visitor_id: string;
  answers: Answer[];
  insight_id: string;
  email?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  created_at: string;
};

export type Answer = {
  step: number;
  value: string | boolean | number;
};

export async function getQuizBySlug(slug: string) {
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (quizError) {
    throw new Error(`Error fetching quiz: ${quizError.message}`);
  }

  // Get questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('order_index', { ascending: true });

  if (questionsError) {
    throw new Error(`Error fetching questions: ${questionsError.message}`);
  }

  // Get tips for this quiz
  const { data: tips, error: tipsError } = await supabase
    .from('tips')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('order_index', { ascending: true });

  if (tipsError) {
    throw new Error(`Error fetching tips: ${tipsError.message}`);
  }

  return {
    quiz,
    questions,
    tips
  };
}

export async function submitQuizResults(
  quizId: string,
  visitorId: string,
  answers: Answer[],
  email?: string,
  utmParams?: Record<string, string>
) {
  try {
    const response = await fetch('/api/quiz-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quiz_id: quizId,
        visitor_id: visitorId,
        answers,
        email,
        ...utmParams,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to submit quiz results:', error);
    throw error;
  }
}
