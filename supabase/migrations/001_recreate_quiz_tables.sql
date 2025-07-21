-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create options table
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table (for score-based results)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rules table (for conditional insights)
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  condition JSONB NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  visitor_id TEXT,
  subscription_id TEXT,
  subscription_plan TEXT,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_responses table
CREATE TABLE IF NOT EXISTS user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES options(id) ON DELETE CASCADE,
  age_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_number);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_options_order ON options(question_id, order_number);
CREATE INDEX idx_results_quiz_id ON results(quiz_id);
CREATE INDEX idx_results_score_range ON results(quiz_id, min_score, max_score);
CREATE INDEX idx_rules_quiz_id ON rules(quiz_id);
CREATE INDEX idx_user_responses_session ON user_responses(session_id);
CREATE INDEX idx_user_responses_quiz ON user_responses(quiz_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_visitor_id ON users(visitor_id);

-- Enable Row Level Security
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read-only for quiz data)
CREATE POLICY "Allow anonymous read access to quizzes" ON quizzes
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to options" ON options
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to results" ON results
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to rules" ON rules
  FOR SELECT USING (true);

-- Create policies for user_responses (anonymous can insert)
CREATE POLICY "Allow anonymous insert to user_responses" ON user_responses
  FOR INSERT WITH CHECK (true);

-- Create policies for users table
CREATE POLICY "Allow anonymous insert to users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update own user record" ON users
  FOR UPDATE USING (visitor_id = current_setting('request.jwt.claim.sub', true));