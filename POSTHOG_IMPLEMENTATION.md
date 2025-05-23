# PostHog Implementation Documentation

This document outlines the PostHog analytics implementation for the Lucid Quiz Flow application. It provides details on the tracked events, user identification, and how to monitor the user journey through the application.

## Setup

PostHog has been implemented using the `posthog-js` library. The initialization happens in the main application entry point through a context provider.

### Configuration

The following environment variables need to be set in the `.env` file:

```
VITE_POSTHOG_API_KEY=your_posthog_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

## User Identification

Users are identified in two ways:

1. **Anonymous Visitors**: All users are assigned a unique `visitorId` (using UUID) stored in localStorage
2. **Identified Users**: When a user provides their email, they are identified with both their `visitorId` and `email`

## Tracked Events

### Quiz Flow Events

| Event Name | Description | Key Properties |
|------------|-------------|---------------|
| `quiz_start` | User begins the quiz | `visitor_id`, `utm_parameters` |
| `question_viewed` | User views a question | `question_id`, `question_text`, `question_type`, `step_index`, `quiz_id`, `timestamp` |
| `question_time_spent` | Time spent on a question | `question_id`, `step_index`, `quiz_id`, `time_spent_ms`, `time_spent_seconds` |
| `option_selected` | User selects an option | `question_id`, `question_type`, `step_index`, `quiz_id`, `option_id`, `option_value`, `time_to_answer_ms` |
| `option_deselected` | User deselects an option in multiselect | `question_id`, `question_type`, `step_index`, `quiz_id`, `option_id` |
| `multiselect_submitted` | User submits multiselect answers | `question_id`, `step_index`, `quiz_id`, `num_selections`, `selected_options` |
| `question_swiped` | User swipes on a question | `direction`, `question_id`, `step_index` |
| `quiz_progress_25_percent` | User reaches 25% of quiz | `visitor_id` |
| `quiz_progress_50_percent` | User reaches 50% of quiz | `visitor_id` |
| `quiz_progress_75_percent` | User reaches 75% of quiz | `visitor_id` |
| `step_navigation` | User navigates between steps | `direction`, `from_step`, `to_step`, `progress_percentage` |
| `quiz_back_button_clicked` | User clicks back button | `visitor_id`, `quiz_id`, `from_step` |
| `quiz_complete` | User completes the quiz | `visitor_id`, `quiz_id`, `quiz_title`, `email`, `score`, `result_id`, `total_questions` |
| `quiz_results_processed` | Quiz results successfully processed and stored | `visitor_id`, `quiz_id`, `quiz_title`, `email`, `score`, `result_id`, `result_title`, `total_questions` |
| `quiz_reset`