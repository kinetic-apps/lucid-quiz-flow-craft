
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const ConsentBar = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem('lucid_consent');
    
    if (!hasConsented) {
      // Show the consent bar after a short delay
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('lucid_consent', 'true');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 safe-paddings">
      <div className="container max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            We use cookies to personalize your experience. By continuing, you agree to our{' '}
            <a href="/privacy" className="text-lucid-violet-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAccept}
            >
              Decline
            </Button>
            <Button 
              className="bg-lucid-violet-600 hover:bg-lucid-violet-700 text-white"
              size="sm"
              onClick={handleAccept}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBar;
