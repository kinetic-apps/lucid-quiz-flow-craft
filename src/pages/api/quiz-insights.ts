
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { matchRules } from '@/lib/matchRules';

// Define the schema for the request body
const ResultsSchema = z.object({
  quiz_id: z.string().uuid(),
  visitor_id: z.string().uuid(),
  answers: z.array(
    z.object({
      step: z.number(),
      value: z.union([z.string(), z.number(), z.boolean()])
    })
  ),
  email: z.string().email().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional()
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const data = ResultsSchema.parse(req.body);

    // Get all rules for this quiz
    const { data: rules, error: rulesError } = await supabase
      .from('rules')
      .select('*')
      .eq('quiz_id', data.quiz_id);

    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      return res.status(500).json({ error: 'Failed to fetch rules' });
    }

    // Find the matching rule based on answers
    const matchedRule = matchRules(data.answers, rules);
    
    if (!matchedRule) {
      console.error('No matching rule found for answers');
      return res.status(404).json({ 
        error: 'No matching insight found',
        insight_md: "We couldn't find a personalized insight for your answers. Please try again or contact support." 
      });
    }

    // Insert the result
    const { data: result, error: resultError } = await supabase
      .from('results')
      .insert({
        quiz_id: data.quiz_id,
        visitor_id: data.visitor_id,
        answers: data.answers,
        insight_id: matchedRule.id,
        email: data.email,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        utm_term: data.utm_term,
        utm_content: data.utm_content
      })
      .select()
      .single();

    if (resultError) {
      console.error('Error inserting result:', resultError);
      return res.status(500).json({ error: 'Failed to save result' });
    }

    // Return the insight markdown
    return res.status(200).json({
      insight_md: matchedRule.insight,
      insight_id: matchedRule.id
    });

  } catch (error) {
    console.error('Error processing quiz results:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
