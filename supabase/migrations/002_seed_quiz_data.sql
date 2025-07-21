-- Insert the main quiz
INSERT INTO quizzes (id, slug, title, description) VALUES 
('d8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'mindfulness-assessment', 'Mindfulness Assessment', 'Discover your personalized mindfulness journey');

-- Insert all questions
INSERT INTO questions (id, quiz_id, text, order_number) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'How often do you feel tired or lack energy, even after rest?', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Do you often leave things to the last minute?', 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'How easily distracted are you?', 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'How often do you feel worried or overwhelmed?', 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'How often do you experience mood swings?', 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Have you felt in harmony with yourself and your circle in recent months?', 6),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'It''s difficult for me to express emotions – do you agree?', 7),
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'I often feel overwhelmed by the amount of tasks I have to do – do you agree?', 8),
('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'I often find it challenging to make a decision – do you agree?', 9),
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'I often struggle to pursue my ambitions due to fear of messing up and failing – do you agree?', 10),
('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Have you ever struggled with accepting compliments because you didn''t believe they are true?', 11),
('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'I tend to feel insecure while talking to others', 12),
('a1b2c3d4-e5f6-7890-abcd-ef1234567813', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'I tend to overthink my partner''s behavior', 13),
('a1b2c3d4-e5f6-7890-abcd-ef1234567814', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Do you often prioritize others'' needs and sacrifice your own ones?', 14),
('a1b2c3d4-e5f6-7890-abcd-ef1234567815', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'When was the last time you felt driven and motivated?', 15),
('a1b2c3d4-e5f6-7890-abcd-ef1234567816', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Are there aspects of your well-being you''d like to address?', 16),
('a1b2c3d4-e5f6-7890-abcd-ef1234567817', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'What do you usually do first thing in the morning?', 17),
('a1b2c3d4-e5f6-7890-abcd-ef1234567818', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'How much time do you dedicate to physical activity each week?', 18),
('a1b2c3d4-e5f6-7890-abcd-ef1234567819', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Do you have any habits that you''d like to quit?', 19),
('a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Is there anything you want to improve about your sleep?', 20),
('a1b2c3d4-e5f6-7890-abcd-ef1234567821', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Have any of the following caused you to struggle more than before?', 21),
('a1b2c3d4-e5f6-7890-abcd-ef1234567822', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'In order to live a happier life, what do you think you need to improve?', 22),
('a1b2c3d4-e5f6-7890-abcd-ef1234567823', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Which of the following would you like to start working on with your plan?', 23),
('a1b2c3d4-e5f6-7890-abcd-ef1234567824', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'How much do you know about behavioral techniques?', 24),
('a1b2c3d4-e5f6-7890-abcd-ef1234567825', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Did you hear about Lucid from an expert?', 25),
('a1b2c3d4-e5f6-7890-abcd-ef1234567826', 'd8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Set your daily goal – pick the amount of time you want to spend on self-development daily', 26);

-- Insert options for each question
-- Question 1: How often do you feel tired or lack energy, even after rest?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q1', 'Often', 3, 1),
('q1', 'Sometimes', 2, 2),
('q1', 'Rarely', 1, 3);

-- Question 2: Do you often leave things to the last minute?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q2', 'Often', 3, 1),
('q2', 'Sometimes', 2, 2),
('q2', 'Never', 1, 3);

-- Question 3: How easily distracted are you?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q3', 'Easily distracted', 4, 1),
('q3', 'Occasionally lose focus', 3, 2),
('q3', 'Rarely lose focus', 2, 3),
('q3', 'Very focused', 1, 4);

-- Question 4: How often do you feel worried or overwhelmed?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q4', 'Often', 3, 1),
('q4', 'Sometimes', 2, 2),
('q4', 'Rarely', 1, 3);

-- Question 5: How often do you experience mood swings?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q5', 'Often', 3, 1),
('q5', 'Sometimes', 2, 2),
('q5', 'Rarely', 1, 3);

-- Question 6: Have you felt in harmony with yourself and your circle in recent months?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q6', 'Yes', 1, 1),
('q6', 'Moderately', 2, 2),
('q6', 'No', 3, 3);

-- Question 7: It's difficult for me to express emotions – do you agree?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q7', 'Strongly disagree', 1, 1),
('q7', 'Disagree', 2, 2),
('q7', 'Neutral', 3, 3),
('q7', 'Agree', 4, 4),
('q7', 'Strongly agree', 5, 5);

-- Question 8: I often feel overwhelmed by the amount of tasks I have to do – do you agree?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q8', 'Strongly disagree', 1, 1),
('q8', 'Disagree', 2, 2),
('q8', 'Neutral', 3, 3),
('q8', 'Agree', 4, 4),
('q8', 'Strongly agree', 5, 5);

-- Question 9: I often find it challenging to make a decision – do you agree?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q9', 'Strongly disagree', 1, 1),
('q9', 'Disagree', 2, 2),
('q9', 'Neutral', 3, 3),
('q9', 'Agree', 4, 4),
('q9', 'Strongly agree', 5, 5);

-- Question 10: I often struggle to pursue my ambitions due to fear of messing up and failing – do you agree?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q10', 'Strongly disagree', 1, 1),
('q10', 'Disagree', 2, 2),
('q10', 'Neutral', 3, 3),
('q10', 'Agree', 4, 4),
('q10', 'Strongly agree', 5, 5);

-- Question 11: Have you ever struggled with accepting compliments because you didn't believe they are true?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q11', 'Almost always', 4, 1),
('q11', 'Depends', 3, 2),
('q11', 'Not at all', 1, 3),
('q11', 'I''m not sure', 2, 4);

-- Question 12: I tend to feel insecure while talking to others
INSERT INTO options (question_id, text, value, order_number) VALUES
('q12', 'Yes', 3, 1),
('q12', 'No', 1, 2),
('q12', 'I''m not sure', 2, 3);

-- Question 13: I tend to overthink my partner's behavior
INSERT INTO options (question_id, text, value, order_number) VALUES
('q13', 'Yes', 3, 1),
('q13', 'No', 1, 2),
('q13', 'I''m not sure', 2, 3);

-- Question 14: Do you often prioritize others' needs and sacrifice your own ones?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q14', 'Often', 3, 1),
('q14', 'Sometimes', 2, 2),
('q14', 'Never', 1, 3);

-- Question 15: When was the last time you felt driven and motivated?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q15', 'A few weeks ago', 1, 1),
('q15', 'Less than a year ago', 2, 2),
('q15', 'More than a year ago', 3, 3),
('q15', 'Never in my life', 4, 4);

-- Question 16: Are there aspects of your well-being you'd like to address? (multiselect)
INSERT INTO options (question_id, text, value, order_number) VALUES
('q16', 'Low energy', 1, 1),
('q16', 'Worry', 1, 2),
('q16', 'Emotional exhaustion', 1, 3),
('q16', 'Overthinking', 1, 4),
('q16', 'Irritability', 1, 5),
('q16', 'I''m totally fine', 0, 6);

-- Question 17: What do you usually do first thing in the morning?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q17', 'Picking up my phone', 3, 1),
('q17', 'Making coffee', 2, 2),
('q17', 'Brushing teeth & Taking shower', 1, 3),
('q17', 'Other', 2, 4);

-- Question 18: How much time do you dedicate to physical activity each week?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q18', '0–2 hours', 4, 1),
('q18', '3–5 hours', 3, 2),
('q18', '6–8 hours', 2, 3),
('q18', 'More than 8 hours', 1, 4);

-- Question 19: Do you have any habits that you'd like to quit? (multiselect)
INSERT INTO options (question_id, text, value, order_number) VALUES
('q19', 'Being late / running out of time', 1, 1),
('q19', 'Self-doubt', 1, 2),
('q19', 'Social media', 1, 3),
('q19', 'Sugar cravings or junk food', 1, 4),
('q19', 'Losing sleep', 1, 5),
('q19', 'Nail-biting', 1, 6),
('q19', 'Binge-watching', 1, 7);

-- Question 20: Is there anything you want to improve about your sleep? (multiselect)
INSERT INTO options (question_id, text, value, order_number) VALUES
('q20', 'Waking up tired', 1, 1),
('q20', 'Waking up during the night', 1, 2),
('q20', 'Difficulty falling asleep', 1, 3),
('q20', 'Unstable sleep schedule', 1, 4),
('q20', 'I sleep well', 0, 5);

-- Question 21: Have any of the following caused you to struggle more than before? (multiselect)
INSERT INTO options (question_id, text, value, order_number) VALUES
('q21', 'Family or relationship', 1, 1),
('q21', 'External circumstances', 1, 2),
('q21', 'My appearance', 1, 3),
('q21', 'Sleep issues', 1, 4),
('q21', 'Job-related stress', 1, 5),
('q21', 'Other', 1, 6);

-- Question 22: In order to live a happier life, what do you think you need to improve? (multiselect)
INSERT INTO options (question_id, text, value, order_number) VALUES
('q22', 'My state of calm', 1, 1),
('q22', 'My focus levels', 1, 2),
('q22', 'My willpower', 1, 3),
('q22', 'My energy levels', 1, 4),
('q22', 'My inner resilience', 1, 5),
('q22', 'Other', 1, 6);

-- Question 23: Which of the following would you like to start working on with your plan? (multiselect)
INSERT INTO options (question_id, text, value, order_number) VALUES
('q23', 'Stop doubting myself', 1, 1),
('q23', 'Build emotional resilience', 1, 2),
('q23', 'Set and achieve goals', 1, 3),
('q23', 'Stop overthinking', 1, 4),
('q23', 'Improve my ability to trust others', 1, 5),
('q23', 'Improve my daily routine', 1, 6);

-- Question 24: How much do you know about behavioral techniques?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q24', 'Nothing at all', 3, 1),
('q24', 'Not that much', 2, 2),
('q24', 'A lot', 1, 3);

-- Question 25: Did you hear about Lucid from an expert?
INSERT INTO options (question_id, text, value, order_number) VALUES
('q25', 'Yes', 1, 1),
('q25', 'No', 2, 2);

-- Question 26: Set your daily goal – pick the amount of time you want to spend on self-development daily
INSERT INTO options (question_id, text, value, order_number) VALUES
('q26', '5 min/day', 1, 1),
('q26', '10 min/day', 2, 2),
('q26', '15 min/day', 3, 3),
('q26', '20 min/day', 4, 4);

-- Add some basic results based on score ranges
INSERT INTO results (quiz_id, title, description, min_score, max_score) VALUES
('d8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Excellent Well-being', 'You''re doing great! Your mindfulness practices are working well for you.', 0, 25),
('d8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Good Well-being', 'You''re on the right track with some areas for improvement.', 26, 50),
('d8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Moderate Well-being', 'There are several areas where mindfulness practices could help you.', 51, 75),
('d8b3c4e2-7f5a-4b9d-8e2f-3a5c7d9e1f3b', 'Needs Attention', 'Your well-being could benefit significantly from structured mindfulness practices.', 76, 100);