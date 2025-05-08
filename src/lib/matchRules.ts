
import type { Answer, Rule } from './supabase';

type Condition = {
  type: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'and' | 'or';
  step?: number;
  value?: any;
  rules?: Condition[];
};

export function matchRules(answers: Answer[], rules: Rule[]): Rule | null {
  // Sort rules by complexity (more complex conditions first)
  const sortedRules = [...rules].sort(
    (a, b) => JSON.stringify(b.condition).length - JSON.stringify(a.condition).length
  );
  
  for (const rule of sortedRules) {
    if (evaluateCondition(rule.condition, answers)) {
      return rule;
    }
  }
  
  return null;
}

function evaluateCondition(condition: Condition, answers: Answer[]): boolean {
  switch (condition.type) {
    case 'equals':
      if (condition.step === undefined) return false;
      const answer = answers.find(a => a.step === condition.step);
      return answer !== undefined && answer.value === condition.value;
    
    case 'contains':
      if (condition.step === undefined) return false;
      const containsAnswer = answers.find(a => a.step === condition.step);
      return containsAnswer !== undefined && 
        (Array.isArray(containsAnswer.value) 
          ? containsAnswer.value.includes(condition.value)
          : String(containsAnswer.value).includes(String(condition.value)));
    
    case 'greater_than':
      if (condition.step === undefined) return false;
      const gtAnswer = answers.find(a => a.step === condition.step);
      return gtAnswer !== undefined && 
        typeof gtAnswer.value === 'number' && 
        gtAnswer.value > (condition.value as number);
    
    case 'less_than':
      if (condition.step === undefined) return false;
      const ltAnswer = answers.find(a => a.step === condition.step);
      return ltAnswer !== undefined && 
        typeof ltAnswer.value === 'number' && 
        ltAnswer.value < (condition.value as number);
    
    case 'and':
      return condition.rules !== undefined && 
        condition.rules.every(rule => evaluateCondition(rule, answers));
    
    case 'or':
      return condition.rules !== undefined && 
        condition.rules.some(rule => evaluateCondition(rule, answers));
    
    default:
      return false;
  }
}
