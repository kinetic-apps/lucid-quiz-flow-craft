import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import posthog from 'posthog-js';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import type { User, Session } from '@supabase/supabase-js'; // Import Supabase types

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
      // posthog.reset(); // We will handle reset more granularly with Supabase auth
    };
  }, [apiKey, hostUrl, options]);

  useEffect(() => {
    if (!isReady) return; // Don't run until PostHog itself is ready

    const identifyUser = (user: User | null | undefined) => {
      if (user) {
        const properties: Record<string, unknown> = {};
        if (user.email) {
          properties.email = user.email;
        }
        // You can add more user properties from user.user_metadata if needed
        // For example: if (user.user_metadata?.name) properties.name = user.user_metadata.name;
        posthog.identify(user.id, properties);
      }
    };

    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log(`Supabase Auth Event: ${event}`, session);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          identifyUser(session.user);
        } else if (event === 'INITIAL_SESSION' && !session) {
          // No initial session, sign in anonymously
          console.log('No initial Supabase session, signing in anonymously...');
          const { data: anonSession, error: anonError } = await supabase.auth.signInAnonymously();
          if (anonError) {
            console.error('Error signing in anonymously:', anonError);
          } else if (anonSession?.user) {
            console.log('Signed in anonymously:', anonSession.user.id);
            identifyUser(anonSession.user);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        posthog.reset();
        console.log('User signed out from Supabase, signing in anonymously again...');
        const { data: anonSession, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          console.error('Error signing in anonymously after sign out:', anonError);
        } else if (anonSession?.user) {
          console.log('Re-signed in anonymously after sign out:', anonSession.user.id);
          // The INITIAL_SESSION or SIGNED_IN event from signInAnonymously will handle identification
        }
      }
    };

    // Check initial session state
    const initializeSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting initial session:', sessionError);
        // If there's an error getting the session, let onAuthStateChange handle it
        return;
      }

      if (session?.user) {
        console.log('Initial Supabase session found by getSession():', session.user.id);
        identifyUser(session.user);
      } else {
        // If no session from getSession(), onAuthStateChange with INITIAL_SESSION event
        // will handle the anonymous sign-in if necessary. We don't need to do it here.
        console.log('No initial Supabase session found by getSession(). onAuthStateChange will handle anonymous sign-in if needed.');
      }
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      // Consider if posthog.reset() is needed here if the provider itself unmounts.
      // Generally, onAuthStateChange handles transitions.
    };
  }, [isReady]); // Depend on isReady

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