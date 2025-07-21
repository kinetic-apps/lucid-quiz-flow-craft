# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview

# Test on mobile devices with network access
npm run dev -- --host
```

## Architecture Overview

This is a React-based mindfulness quiz application with a multi-step flow leading to paid subscriptions.

### Core Flow
1. **Quiz Journey**: Multi-step personalized mindfulness quiz with various question types
2. **Data Collection**: Email capture with quiz results storage
3. **Monetization**: Stripe integration for subscription checkout
4. **Analytics**: Comprehensive PostHog tracking throughout the user journey

### Key Technical Decisions

- **State Management**: Quiz state managed via React Context (`QuizContext`) with localStorage persistence
- **Routing**: React Router v6 with protected routes for quiz flow
- **UI Components**: shadcn/ui component library with Tailwind CSS
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Payment Processing**: Stripe Checkout with serverless Supabase edge functions
- **Analytics**: PostHog event tracking with visitor UUID identification

### Important Patterns

1. **Quiz Navigation**: Uses custom `useMobileScrollLock` hook to prevent scrolling on quiz pages
2. **Progress Tracking**: Percentage-based milestones (25%, 50%, 75%) tracked via PostHog
3. **Data Flow**: Quiz answers → LocalStorage → Supabase DB → Stripe metadata
4. **Error Handling**: Toast notifications using Sonner library
5. **Form Validation**: React Hook Form with Zod schemas

## Key Files and Locations

- **Quiz Logic**: `src/context/QuizContext.tsx` - Central quiz state management
- **Question Components**: `src/components/quiz/slides/` - Different slide types
- **Payment Flow**: `src/pages/checkout/` and `supabase/functions/stripe-checkout/`
- **Analytics**: `src/context/PostHogContext.tsx` and event tracking throughout components
- **Type Definitions**: `src/types/` - Quiz, payment, and component types

## Environment Variables

Required for development:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_POSTHOG_API_KEY
VITE_POSTHOG_HOST
```

For Stripe webhooks:
```
VITE_STRIPE_SECRET_KEY
VITE_STRIPE_WEBHOOK_SECRET
```

## Testing Considerations

- **Mobile Testing**: Always test scroll behavior on quiz pages (should be locked)
- **Payment Flow**: Use Stripe test cards and webhook forwarding for local development
- **Analytics**: Check PostHog dashboard for event firing and user journey tracking
- **Multi-step Form**: Test browser back button behavior and progress persistence

## Common Tasks

### Adding a New Quiz Question
1. Define the question in the quiz configuration
2. Ensure proper type handling in `QuizContext`
3. Add PostHog tracking for the new question type
4. Test mobile scroll behavior

### Modifying Payment Plans
1. Update Stripe product IDs in checkout components
2. Modify Supabase edge function if pricing logic changes
3. Update UI in `PricingSection` component

### Debugging Analytics
1. Check PostHog implementation doc (`POSTHOG_IMPLEMENTATION.md`)
2. Use browser console to verify event firing
3. Check visitor ID persistence in localStorage