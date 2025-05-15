import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import posthog from 'posthog-js';

interface PostHogContextType {
  posthog: typeof posthog;
  track: (eventName: string, eventProperties?: Record<string, unknown>) => void;
  identify: (id: string, properties?: Record<string, unknown>) => void;
  resetIdentity: () => void;
  isReady: boolean;
  isFeatureEnabled: (key: string) => boolean;
  getFeatureFlag: (key: string) => string | boolean | undefined;
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

interface PostHogProviderProps {
  children: ReactNode;
  apiKey: string;
  hostUrl?: string;
  options?: Record<string, unknown>;
}

export function PostHogProvider({
  children,
  apiKey,
  hostUrl = 'https://app.posthog.com',
  options,
}: PostHogProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      console.warn('PostHog API key not provided');
      return;
    }

    // Initialize PostHog
    posthog.init(apiKey, {
      api_host: hostUrl,
      capture_pageview: true,
      capture_pageleave: true,
      loaded: (ph) => {
        setIsReady(true);
        // Ensure feature flags are loaded before considering PostHog ready for them
        ph.onFeatureFlags(() => {
          // You could set another state here if you need to react to flags being loaded
          // For now, just logging, as isReady already covers general readiness
          console.log('PostHog feature flags loaded.');
        });
      },
      ...options,
    });

    // Clean up on unmount
    return () => {
      posthog.reset();
    };
  }, [apiKey, hostUrl, options]);

  // Utility function to track events
  const track = (eventName: string, eventProperties?: Record<string, unknown>) => {
    if (!isReady) {
      console.warn(`PostHog not ready, event '${eventName}' not tracked`);
      return;
    }
    posthog.capture(eventName, eventProperties);
  };

  // Identify a user
  const identify = (id: string, properties?: Record<string, unknown>) => {
    if (!isReady) {
      console.warn(`PostHog not ready, user '${id}' not identified`);
      return;
    }
    posthog.identify(id, properties);
  };

  // Reset identity
  const resetIdentity = () => {
    if (!isReady) {
      console.warn('PostHog not ready, identity not reset');
      return;
    }
    posthog.reset();
  };

  const isFeatureEnabled = (key: string): boolean => {
    if (!isReady) {
      console.warn(`PostHog not ready, cannot check feature flag '${key}'. Returning false.`);
      return false;
    }
    return posthog.isFeatureEnabled(key) || false; // Ensure it returns boolean
  };

  const getFeatureFlag = (key: string): string | boolean | undefined => {
    if (!isReady) {
      console.warn(`PostHog not ready, cannot get feature flag '${key}'. Returning undefined.`);
      return undefined;
    }
    return posthog.getFeatureFlag(key);
  };

  return (
    <PostHogContext.Provider
      value={{
        posthog,
        track,
        identify,
        resetIdentity,
        isReady,
        isFeatureEnabled,
        getFeatureFlag
      }}
    >
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  const context = useContext(PostHogContext);
  if (context === undefined) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
} 