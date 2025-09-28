import React, { createContext, useContext, useState, useCallback } from 'react';

interface OnboardingContextType {
  shouldShowWelcomeGuide: boolean;
  triggerWelcomeGuide: () => void;
  clearWelcomeGuide: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [shouldShowWelcomeGuide, setShouldShowWelcomeGuide] = useState(false);

  const triggerWelcomeGuide = useCallback(() => {
    setShouldShowWelcomeGuide(true);
  }, []);

  const clearWelcomeGuide = useCallback(() => {
    setShouldShowWelcomeGuide(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        shouldShowWelcomeGuide,
        triggerWelcomeGuide,
        clearWelcomeGuide
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}