import React, { createContext, useContext, useEffect, useState } from 'react';

type FontScale = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean | ((prev: boolean) => boolean)) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    return (localStorage.getItem('sky_font_scale') as FontScale) || 'normal';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('sky_high_contrast') === 'true';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('sky_reduced_motion') === 'true';
  });

  const [dyslexiaFont, setDyslexiaFontState] = useState<boolean>(() => {
    return localStorage.getItem('sky_dyslexia_font') === 'true';
  });

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
    localStorage.setItem('sky_font_scale', scale);
  };

  const setHighContrast = (val: boolean | ((prev: boolean) => boolean)) => {
    setHighContrastState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('sky_high_contrast', String(next));
      return next;
    });
  };

  const setReducedMotion = (val: boolean | ((prev: boolean) => boolean)) => {
    setReducedMotionState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('sky_reduced_motion', String(next));
      return next;
    });
  };

  const setDyslexiaFont = (val: boolean | ((prev: boolean) => boolean)) => {
    setDyslexiaFontState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('sky_dyslexia_font', String(next));
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    // Apply font scale
    root.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
    root.classList.add(`text-scale-${fontScale}`);

    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply dyslexia font
    if (dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }
  }, [fontScale, highContrast, dyslexiaFont]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        highContrast,
        setHighContrast,
        reducedMotion,
        setReducedMotion,
        dyslexiaFont,
        setDyslexiaFont,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
