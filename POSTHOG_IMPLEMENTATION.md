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
| `quiz_reset` | User resets the quiz | `visitor_id` |
| `quiz_submission_error` | Error submitting quiz | `visitor_id`, `quiz_id`, `quiz_title`, `email` |
| `age_range_set` | User sets age range | `age_range` |
| `reset_age_range` | User resets age range | `visitor_id` |

### Checkout Flow Events

| Event Name | Description | Key Properties |
|------------|-------------|---------------|
| `checkout_page_viewed` | User views checkout page | `visitor_id`, `user_id`, `user_email` |
| `plan_selected` | User selects a subscription plan | `visitor_id`, `user_id`, `plan_id`, `plan_name`, `plan_price` |
| `checkout_initiated` | User initiates checkout | `visitor_id`, `user_id`, `plan_id`, `plan_name`, `plan_price` |
| `redirect_to_stripe` | User is redirected to Stripe | `visitor_id`, `user_id`, `session_id`, `plan_id` |
| `checkout_error` | Error during checkout | `visitor_id`, `error_type`, `error_message`, `plan_id` |
| `purchase_successful` | Purchase completed successfully | `visitor_id`, `user_id`, `user_email`, `session_id` |
| `navigate_from_success` | User navigates from success page | `visitor_id`, `destination`, `source` |

## Funnel Setup in PostHog

To track the user journey from quiz start to purchase, set up the following funnel in PostHog:

1. `quiz_start`
2. `quiz_progress_25_percent` 
3. `quiz_progress_50_percent`
4. `quiz_progress_75_percent`
5. `quiz_complete`
6. `checkout_page_viewed`
7. `checkout_initiated`
8. `redirect_to_stripe`
9. `purchase_successful`

## User Properties

The following user properties are automatically tracked:

- `email`: User's email address (when provided)
- `user_id`: Internal user ID from database (when available)
- `has_subscription`: Boolean indicating if user has purchased a subscription

## Adding Additional Tracking

To add more tracking to the application, use the `usePostHog` hook which provides:

- `track`: For tracking custom events
- `identify`: For identifying users
- `resetIdentity`: For resetting user identity

Example:

```tsx
import { usePostHog } from '@/context/PostHogContext';

const YourComponent = () => {
  const { track } = usePostHog();
  
  const handleAction = () => {
    track('action_performed', {
      action_type: 'example',
      custom_property: 'value'
    });
  };
  
  return <button onClick={handleAction}>Perform Action</button>;
};
```

## Migrating from Amplitude

The implementation includes backward compatibility with Amplitude for a transitional period. Once you confirm that PostHog is capturing all necessary events, the Amplitude integration can be removed.

## Troubleshooting

If events are not appearing in PostHog:

1. Verify that the correct API key is set in the environment variables
2. Check browser console for any errors related to PostHog
3. Ensure that PostHog is initialized before tracking events
4. Verify that the PostHog host URL is correct 