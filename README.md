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

## Testing on Mobile Devices

To test the mobile experience and ensure scroll behavior works correctly:

### Using Chrome DevTools

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open Chrome and navigate to your local development URL (usually http://localhost:5173)

3. Open Chrome DevTools (right-click and select "Inspect" or press F12)

4. Click on the "Toggle device toolbar" button (or press Ctrl+Shift+M / Cmd+Shift+M)

5. Select a device from the dropdown at the top of the viewport (e.g., iPhone 12 Pro)

6. Test the different pages:
   - Quiz pages should have scrolling disabled (locked viewport)
   - Checkout page should allow scrolling for longer content

### Using iOS Simulator (on macOS)

If you have Xcode installed:

1. Start the development server with the host flag to make it accessible on your network:
   ```bash
   npm run dev -- --host
   ```

2. Find your local IP address:
   ```bash
   ipconfig getifaddr en0
   ```

3. Open Xcode and launch the iOS Simulator

4. In the Simulator, open Safari and navigate to your IP address with the port 
   (e.g., http://192.168.1.100:5173)

5. Test scroll behavior across different pages

### Using Real Devices

1. Start the development server with the host flag:
   ```bash
   npm run dev -- --host
   ```

2. Find your local IP address:
   ```bash
   ipconfig getifaddr en0
   ```

3. On your mobile device, connect to the same WiFi network and navigate to 
   your IP address with the port in a browser

4. Test scroll behavior on different pages

### Troubleshooting Mobile Scroll Issues

If you encounter issues with the mobile scroll behavior:

- Make sure the viewport meta tag in `index.html` is correctly set:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  ```

- Check that the `useMobileScrollLock` hook is properly applied to each page

- Test with different browsers (Safari on iOS, Chrome on Android) as their behavior can vary

## License

[Your license information here]
