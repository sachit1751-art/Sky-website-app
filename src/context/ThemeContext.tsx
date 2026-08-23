import React, { createContext, useContext, useEffect, useState } from 'react';
import { persistentStorage } from '../lib/capacitor';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check synchronous storage if available for instant paint
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('sky-theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    // Default to light mode for all new users
    return 'light';
  });

  // Re-hydrate from @capacitor/preferences on native platform boot
  useEffect(() => {
    let isMounted = true;
    persistentStorage.getThemePreference().then((saved) => {
      if (isMounted && saved && (saved === 'light' || saved === 'dark') && saved !== theme) {
        setThemeState(saved);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    // Save to @capacitor/preferences & localStorage
    persistentStorage.setThemePreference(theme).catch(() => {});
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const setTheme = (newTheme: Theme) => {
    if (newTheme === theme) return;

    const performTransition = () => {
      document.documentElement.classList.add('theme-transitioning');
      setThemeState(newTheme);
      return new Promise<void>((resolve) => {
        window.setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning');
          resolve();
        }, 400);
      });
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(() => {
        return performTransition();
      });
    } else {
      performTransition();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
