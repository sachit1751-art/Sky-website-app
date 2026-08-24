import React, { createContext, useContext, useEffect, useState } from 'react';
import { persistentStorage, isNative, configureStatusBar } from '../lib/capacitor';
import { App as CapApp } from '@capacitor/app';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('sky-theme') as Theme | null;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
        // Check system preference if no saved theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      } catch (e) {
        // fallback
      }
    }
    return 'light';
  });

  // Re-hydrate from @capacitor/preferences on native platform boot
  useEffect(() => {
    let isMounted = true;
    persistentStorage.getThemePreference().then((saved) => {
      const savedManual = typeof window !== 'undefined' ? localStorage.getItem('sky-theme-manual') : null;
      if (isMounted && saved && (saved === 'light' || saved === 'dark') && saved !== theme && savedManual) {
        setThemeState(saved);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Set up Capacitor App plugin state listener for automatic Android system-level theme synchronization
  useEffect(() => {
    let appStateListener: any;

    const checkAndSyncSystemTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme: Theme = prefersDark ? 'dark' : 'light';
      const isManual = localStorage.getItem('sky-theme-manual') === 'true';
      
      // If not manually overridden by user, synchronize with Android system preference
      if (!isManual) {
        setTheme(systemTheme);
      }
    };

    // Listen to Capacitor App state changes (e.g. resuming app from background / system settings)
    if (isNative) {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          checkAndSyncSystemTheme();
        }
      }).then((listener) => {
        appStateListener = listener;
      }).catch(() => {});
    }

    // Also listen to system media query changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const isManual = localStorage.getItem('sky-theme-manual') === 'true';
      if (!isManual) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }
      mediaQuery.removeEventListener('change', handleMediaChange);
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
    configureStatusBar(theme === 'dark').catch(() => {});
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('sky-theme-manual', 'true');
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
