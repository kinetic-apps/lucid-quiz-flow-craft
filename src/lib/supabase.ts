import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bsqmlzocdhummisrouzs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcW1sem9jZGh1bW1pc3JvdXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTg0OTYsImV4cCI6MjA2MjI5NDQ5Nn0.nHz1lXvEjSQnllLeXVJy8u7hiWsEZHmfk0JYyxKTXgg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Quiz = {
  id: string;
  slug: string;
  title: string;
  description: string;
  created_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  text: string;
  order_number: number;
  created_at: string;
};

export type Option = {
  id: string;
  question_id: string;
  text: string;
  value: number;
  order_number: number;
  created_at: string;
};

export type UserResponse = {
  id: string;
  session_id: string;
  quiz_id: string;
  question_id: string;
  selected_option_id: string;
  created_at: string;
};

export type Result = {
  id: string;
  quiz_id: string;
  title: string;
  description: string;
  min_score: number;
  max_score: number;
  created_at: string;
};

export type Answer = {
  step: number;
  value: string | boolean | number;
  question_id?: string;
  selected_option_id?: string;
};

export async function getQuizBySlug(slug: string) {
  // Fetch quiz data
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (quizError) {
    console.error('Error fetching quiz:', quizError);
    throw new Error(`Error fetching quiz: ${quizError.message}`);
  }

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Fetch questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('order_number', { ascending: true });

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    throw new Error(`Error fetching questions: ${questionsError.message}`);
  }

  // For each question, fetch its options
  const questionsWithOptions = await Promise.all(
    questions.map(async (question) => {
      const { data: options, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .eq('question_id', question.id)
        .order('order_number', { ascending: true });

      if (optionsError) {
        console.error('Error fetching options:', optionsError);
        throw new Error(`Error fetching options: ${optionsError.message}`);
      }

      // Add type property based on question pattern
      let type = 'radio';
      
      // Check for likert scale questions
      if (question.text.includes('agree') || question.text.includes('rate')) {
        type = 'likert';
      }
      
      // Check for multi-select questions
      const multiSelectIndicators = [
        'choose all',
        'select all',
        'all that apply',
        'aspects of your well-being',
        'habits that you\'d like to quit',
        'improve about your sleep',
        'caused you to struggle',
        'need to improve',
        'like to start working on'
      ];
      
      const isMultiSelect = multiSelectIndicators.some(indicator => 
        question.text.toLowerCase().includes(indicator.toLowerCase())
      );
      
      if (isMultiSelect) {
        type = 'multiselect';
      }

      return {
        ...question,
        type,
        options: options.map(opt => opt.text),
        optionsData: options
      };
    })
  );

  // Mock tips data for compatibility with existing code
  const tips = [];

  // Add gradient properties for UI compatibility
  const quizWithGradient = {
    ...quiz,
    gradient_from: '#7928CA',
    gradient_to: '#FF0080'
  };

  return {
    quiz: quizWithGradient,
    questions: questionsWithOptions,
    tips
  };
}

export async function submitQuizResults(
  quizId: string,
  visitorId: string,
  answers: Answer[],
  email?: string,
  utmParams?: Record<string, string>,
  ageRange?: string | null
) {
  try {
    // Calculate total score
    let totalScore = 0;
    
    // Insert each answer to user_responses
    const userResponses = answers.map(answer => ({
      session_id: visitorId,
      quiz_id: quizId,
      question_id: answer.question_id,
      selected_option_id: answer.selected_option_id,
      age_range: ageRange || null
    }));

    for (const response of userResponses) {
      const { error } = await supabase
        .from('user_responses')
        .insert(response);
        
      if (error) {
        console.error('Error saving response:', error);
      }
    }

    // Fetch the value from each selected option to calculate score
    const optionIds = answers.map(a => a.selected_option_id).filter(Boolean);
    if (optionIds.length > 0) {
      const { data: options } = await supabase
        .from('options')
        .select('value')
        .in('id', optionIds);
      
      if (options && options.length > 0) {
        totalScore = options.reduce((sum, opt) => sum + opt.value, 0);
      }
    }

    // Fetch appropriate result based on score
    const { data: result, error: resultError } = await supabase
      .from('results')
      .select('*')
      .eq('quiz_id', quizId)
      .lte('min_score', totalScore)
      .gte('max_score', totalScore)
      .single();

    if (resultError) {
      console.error('Error fetching result:', resultError);
      return { 
        score: totalScore,
        result: {
          title: 'Your Productivity Assessment',
          description: 'Thank you for completing the quiz!'
        }
      };
    }

    return {
      score: totalScore,
      result
    };
  } catch (error) {
    console.error('Failed to submit quiz results:', error);
    throw error;
  }
}
