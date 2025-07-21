-- Insert the main quiz
INSERT INTO quizzes (slug, title, description) VALUES 
('mindfulness-assessment', 'Mindfulness Assessment', 'Discover your personalized mindfulness journey');

-- Get the quiz ID for referencing
DO $$
DECLARE 
    quiz_uuid UUID;
    q1_id UUID; q2_id UUID; q3_id UUID; q4_id UUID; q5_id UUID; q6_id UUID;
    q7_id UUID; q8_id UUID; q9_id UUID; q10_id UUID; q11_id UUID; q12_id UUID;
    q13_id UUID; q14_id UUID; q15_id UUID; q16_id UUID; q17_id UUID; q18_id UUID;
    q19_id UUID; q20_id UUID; q21_id UUID; q22_id UUID; q23_id UUID; q24_id UUID;
    q25_id UUID; q26_id UUID;
BEGIN
    -- Get the quiz ID
    SELECT id INTO quiz_uuid FROM quizzes WHERE slug = 'mindfulness-assessment';
    
    -- Insert questions and get their IDs
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'How often do you feel tired or lack energy, even after rest?', 1) RETURNING id INTO q1_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Do you often leave things to the last minute?', 2) RETURNING id INTO q2_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'How easily distracted are you?', 3) RETURNING id INTO q3_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'How often do you feel worried or overwhelmed?', 4) RETURNING id INTO q4_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'How often do you experience mood swings?', 5) RETURNING id INTO q5_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Have you felt in harmony with yourself and your circle in recent months?', 6) RETURNING id INTO q6_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'It''s difficult for me to express emotions – do you agree?', 7) RETURNING id INTO q7_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'I often feel overwhelmed by the amount of tasks I have to do – do you agree?', 8) RETURNING id INTO q8_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'I often find it challenging to make a decision – do you agree?', 9) RETURNING id INTO q9_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'I often struggle to pursue my ambitions due to fear of messing up and failing – do you agree?', 10) RETURNING id INTO q10_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Have you ever struggled with accepting compliments because you didn''t believe they are true?', 11) RETURNING id INTO q11_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'I tend to feel insecure while talking to others', 12) RETURNING id INTO q12_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'I tend to overthink my partner''s behavior', 13) RETURNING id INTO q13_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Do you often prioritize others'' needs and sacrifice your own ones?', 14) RETURNING id INTO q14_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'When was the last time you felt driven and motivated?', 15) RETURNING id INTO q15_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Are there aspects of your well-being you''d like to address?', 16) RETURNING id INTO q16_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'What do you usually do first thing in the morning?', 17) RETURNING id INTO q17_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'How much time do you dedicate to physical activity each week?', 18) RETURNING id INTO q18_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Do you have any habits that you''d like to quit?', 19) RETURNING id INTO q19_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Is there anything you want to improve about your sleep?', 20) RETURNING id INTO q20_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Have any of the following caused you to struggle more than before?', 21) RETURNING id INTO q21_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'In order to live a happier life, what do you think you need to improve?', 22) RETURNING id INTO q22_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Which of the following would you like to start working on with your plan?', 23) RETURNING id INTO q23_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'How much do you know about behavioral techniques?', 24) RETURNING id INTO q24_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Did you hear about Lucid from an expert?', 25) RETURNING id INTO q25_id;
    INSERT INTO questions (quiz_id, text, order_number) VALUES
    (quiz_uuid, 'Set your daily goal – pick the amount of time you want to spend on self-development daily', 26) RETURNING id INTO q26_id;

    -- Insert options for each question
    -- Question 1
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q1_id, 'Often', 3, 1),
    (q1_id, 'Sometimes', 2, 2),
    (q1_id, 'Rarely', 1, 3);

    -- Question 2
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q2_id, 'Often', 3, 1),
    (q2_id, 'Sometimes', 2, 2),
    (q2_id, 'Never', 1, 3);

    -- Question 3
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q3_id, 'Easily distracted', 4, 1),
    (q3_id, 'Occasionally lose focus', 3, 2),
    (q3_id, 'Rarely lose focus', 2, 3),
    (q3_id, 'Very focused', 1, 4);

    -- Question 4
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q4_id, 'Often', 3, 1),
    (q4_id, 'Sometimes', 2, 2),
    (q4_id, 'Rarely', 1, 3);

    -- Question 5
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q5_id, 'Often', 3, 1),
    (q5_id, 'Sometimes', 2, 2),
    (q5_id, 'Rarely', 1, 3);

    -- Question 6
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q6_id, 'Yes', 1, 1),
    (q6_id, 'Moderately', 2, 2),
    (q6_id, 'No', 3, 3);

    -- Question 7
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q7_id, 'Strongly disagree', 1, 1),
    (q7_id, 'Disagree', 2, 2),
    (q7_id, 'Neutral', 3, 3),
    (q7_id, 'Agree', 4, 4),
    (q7_id, 'Strongly agree', 5, 5);

    -- Question 8
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q8_id, 'Strongly disagree', 1, 1),
    (q8_id, 'Disagree', 2, 2),
    (q8_id, 'Neutral', 3, 3),
    (q8_id, 'Agree', 4, 4),
    (q8_id, 'Strongly agree', 5, 5);

    -- Question 9
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q9_id, 'Strongly disagree', 1, 1),
    (q9_id, 'Disagree', 2, 2),
    (q9_id, 'Neutral', 3, 3),
    (q9_id, 'Agree', 4, 4),
    (q9_id, 'Strongly agree', 5, 5);

    -- Question 10
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q10_id, 'Strongly disagree', 1, 1),
    (q10_id, 'Disagree', 2, 2),
    (q10_id, 'Neutral', 3, 3),
    (q10_id, 'Agree', 4, 4),
    (q10_id, 'Strongly agree', 5, 5);

    -- Question 11
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q11_id, 'Almost always', 4, 1),
    (q11_id, 'Depends', 3, 2),
    (q11_id, 'Not at all', 1, 3),
    (q11_id, 'I''m not sure', 2, 4);

    -- Question 12
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q12_id, 'Yes', 3, 1),
    (q12_id, 'No', 1, 2),
    (q12_id, 'I''m not sure', 2, 3);

    -- Question 13
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q13_id, 'Yes', 3, 1),
    (q13_id, 'No', 1, 2),
    (q13_id, 'I''m not sure', 2, 3);

    -- Question 14
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q14_id, 'Often', 3, 1),
    (q14_id, 'Sometimes', 2, 2),
    (q14_id, 'Never', 1, 3);

    -- Question 15
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q15_id, 'A few weeks ago', 1, 1),
    (q15_id, 'Less than a year ago', 2, 2),
    (q15_id, 'More than a year ago', 3, 3),
    (q15_id, 'Never in my life', 4, 4);

    -- Question 16 (multiselect)
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q16_id, 'Low energy', 1, 1),
    (q16_id, 'Worry', 1, 2),
    (q16_id, 'Emotional exhaustion', 1, 3),
    (q16_id, 'Overthinking', 1, 4),
    (q16_id, 'Irritability', 1, 5),
    (q16_id, 'I''m totally fine', 0, 6);

    -- Question 17
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q17_id, 'Picking up my phone', 3, 1),
    (q17_id, 'Making coffee', 2, 2),
    (q17_id, 'Brushing teeth & Taking shower', 1, 3),
    (q17_id, 'Other', 2, 4);

    -- Question 18
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q18_id, '0–2 hours', 4, 1),
    (q18_id, '3–5 hours', 3, 2),
    (q18_id, '6–8 hours', 2, 3),
    (q18_id, 'More than 8 hours', 1, 4);

    -- Question 19 (multiselect)
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q19_id, 'Being late / running out of time', 1, 1),
    (q19_id, 'Self-doubt', 1, 2),
    (q19_id, 'Social media', 1, 3),
    (q19_id, 'Sugar cravings or junk food', 1, 4),
    (q19_id, 'Losing sleep', 1, 5),
    (q19_id, 'Nail-biting', 1, 6),
    (q19_id, 'Binge-watching', 1, 7);

    -- Question 20 (multiselect)
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q20_id, 'Waking up tired', 1, 1),
    (q20_id, 'Waking up during the night', 1, 2),
    (q20_id, 'Difficulty falling asleep', 1, 3),
    (q20_id, 'Unstable sleep schedule', 1, 4),
    (q20_id, 'I sleep well', 0, 5);

    -- Question 21 (multiselect)
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q21_id, 'Family or relationship', 1, 1),
    (q21_id, 'External circumstances', 1, 2),
    (q21_id, 'My appearance', 1, 3),
    (q21_id, 'Sleep issues', 1, 4),
    (q21_id, 'Job-related stress', 1, 5),
    (q21_id, 'Other', 1, 6);

    -- Question 22 (multiselect)
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q22_id, 'My state of calm', 1, 1),
    (q22_id, 'My focus levels', 1, 2),
    (q22_id, 'My willpower', 1, 3),
    (q22_id, 'My energy levels', 1, 4),
    (q22_id, 'My inner resilience', 1, 5),
    (q22_id, 'Other', 1, 6);

    -- Question 23 (multiselect)
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q23_id, 'Stop doubting myself', 1, 1),
    (q23_id, 'Build emotional resilience', 1, 2),
    (q23_id, 'Set and achieve goals', 1, 3),
    (q23_id, 'Stop overthinking', 1, 4),
    (q23_id, 'Improve my ability to trust others', 1, 5),
    (q23_id, 'Improve my daily routine', 1, 6);

    -- Question 24
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q24_id, 'Nothing at all', 3, 1),
    (q24_id, 'Not that much', 2, 2),
    (q24_id, 'A lot', 1, 3);

    -- Question 25
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q25_id, 'Yes', 1, 1),
    (q25_id, 'No', 2, 2);

    -- Question 26
    INSERT INTO options (question_id, text, value, order_number) VALUES
    (q26_id, '5 min/day', 1, 1),
    (q26_id, '10 min/day', 2, 2),
    (q26_id, '15 min/day', 3, 3),
    (q26_id, '20 min/day', 4, 4);

    -- Add results
    INSERT INTO results (quiz_id, title, description, min_score, max_score) VALUES
    (quiz_uuid, 'Excellent Well-being', 'You''re doing great! Your mindfulness practices are working well for you.', 0, 25),
    (quiz_uuid, 'Good Well-being', 'You''re on the right track with some areas for improvement.', 26, 50),
    (quiz_uuid, 'Moderate Well-being', 'There are several areas where mindfulness practices could help you.', 51, 75),
    (quiz_uuid, 'Needs Attention', 'Your well-being could benefit significantly from structured mindfulness practices.', 76, 100);
END $$;