# Lucid Quiz Flow: Mindfulness Quiz Application

## Project Description

Lucid Quiz Flow is a React-based web application that offers a personalized mindfulness quiz experience. The application helps users discover mindfulness techniques tailored to their lifestyle, preferences, and goals.

### Key Features
- Personalized mindfulness quiz flow
- Gender selection and customized user experience
- Stripe integration for premium subscription options
- User data storage with Supabase
- Modern, responsive UI built with React, Tailwind CSS, and shadcn/ui

## Tech Stack

This project is built with:

- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Routing**: React Router
- **Backend**: Supabase (Authentication, Database)
- **Payments**: Stripe integration
- **Styling**: Tailwind CSS with custom configuration

## Getting Started

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone https://github.com/yourusername/lucid-quiz-flow-craft.git

# Navigate to the project directory
cd lucid-quiz-flow-craft

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Stripe Integration

This project includes Stripe integration for subscription payments. The flow works as follows:

1. Users complete the mindfulness quiz and provide their email
2. They're directed to a checkout page with subscription options
3. Upon selecting a plan, they're redirected to Stripe Checkout
4. After payment, subscription details are stored in Supabase

### Setup

To set up the Stripe integration:

1. Run the setup script: `sh setup-stripe.sh`
2. Update your environment variables:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   VITE_STRIPE_SECRET_KEY=sk_test_your_secret_key
   VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```
3. For local testing with webhooks, use Stripe CLI:
   ```
   stripe listen --forward-to http://localhost:5001/api/webhook
   ```

## Supabase Integration

The application uses Supabase for:
- User authentication
- Storing quiz results
- Maintaining subscription information
- Webhooks for Stripe events

## Project Structure

- `/src`: Main source code
  - `/components`: Reusable UI components
  - `/pages`: Application pages including quiz flow
  - `/context`: React context providers
  - `/hooks`: Custom React hooks
  - `/lib`: Utility functions and configurations
  - `/integrations`: Integration with external services (Stripe, Supabase)
- `/supabase`: Supabase configuration and migrations
- `/public`: Static assets

## Development

```sh
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

[Your license information here]
