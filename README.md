# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5610ff35-3aaa-48fa-872f-dde3e219d4e5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5610ff35-3aaa-48fa-872f-dde3e219d4e5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- Stripe (for payments)

## Stripe Integration

This project includes a Stripe integration for subscription payments. The integration works as follows:

1. Users complete the quiz and provide their email
2. They're directed to a checkout page with subscription options
3. Upon selecting a plan, they're redirected to Stripe Checkout
4. After payment, their subscription details are stored in Supabase
5. A Supabase Edge Function or Express server handles Stripe webhooks

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
4. For production, set up a Supabase Edge Function to handle webhook events

### Supabase Schema

The user table includes the following fields for Stripe integration:
- `stripe_customer_id`: The Stripe customer ID
- `subscription_id`: The Stripe subscription ID
- `subscription_plan`: The name of the plan
- `subscription_start_date`: When the subscription starts
- `subscription_end_date`: When the subscription ends
- `is_premium`: Boolean flag indicating if the user has an active subscription

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5610ff35-3aaa-48fa-872f-dde3e219d4e5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
