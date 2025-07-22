// Utility to detect if we're in Stripe test mode
export const isStripeTestMode = (): boolean => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  return publishableKey.startsWith('pk_test_');
};

// Get test mode flag for API calls
export const getTestModeFlag = () => {
  return isStripeTestMode() ? { testMode: true } : {};
};