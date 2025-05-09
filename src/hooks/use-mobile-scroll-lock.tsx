import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

interface UseMobileScrollLockOptions {
  allowScroll?: boolean;
  dependencies?: React.DependencyList;
}

/**
 * Hook to control scroll locking on mobile devices
 * @param options.allowScroll Set to true for pages that should allow scrolling (checkout, long content)
 * @param options.dependencies Array of dependencies to trigger recalculation (similar to useEffect)
 */
export function useMobileScrollLock({ 
  allowScroll = false,
  dependencies = []
}: UseMobileScrollLockOptions = {}) {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isMobile) return;
    
    const html = document.documentElement;
    const body = document.body;
    
    if (allowScroll) {
      // Add scroll-allowing classes
      html.classList.remove('mobile-no-scroll');
      body.classList.remove('mobile-no-scroll');
      html.classList.add('allow-scroll-page');
      body.classList.add('allow-scroll-page');
    } else {
      // Add scroll-preventing classes
      html.classList.add('mobile-no-scroll');
      body.classList.add('mobile-no-scroll');
      html.classList.remove('allow-scroll-page');
      body.classList.remove('allow-scroll-page');
    }
    
    // Clean up function
    return () => {
      html.classList.remove('mobile-no-scroll', 'allow-scroll-page');
      body.classList.remove('mobile-no-scroll', 'allow-scroll-page');
    };
  }, [isMobile, allowScroll, ...dependencies]);
} 