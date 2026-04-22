import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { dataService } from '../services/dataService';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load theme from user settings on mount or user change
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        const userData = await dataService.getUserData(user.id);
        const savedTheme = userData.settings?.theme || 'light';
        setThemeState(savedTheme);
      } else {
        // Fallback for non-logged in users (e.g. landing page)
        const guestTheme = localStorage.getItem('guest_theme') as Theme || 'light';
        setThemeState(guestTheme);
      }
    };
    loadTheme();
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (targetTheme: Theme) => {
      let result: 'light' | 'dark' = 'light';
      
      if (targetTheme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        result = systemDark ? 'dark' : 'light';
      } else {
        result = targetTheme as 'light' | 'dark';
      }

      root.classList.remove('light', 'dark');
      root.classList.add(result);
      setResolvedTheme(result);
    };

    applyTheme(theme);

    // Listen for system theme changes if in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      const userData = await dataService.getUserData(user.id);
      const settings = { ...(userData.settings || {}), theme: newTheme };
      await dataService.updateSection(user.id, 'settings', settings);
    } else {
      localStorage.setItem('guest_theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
