/**
 * useTheme Hook
 * Manages theme state (light/dark mode) with local storage persistence
 */

import { useState, useEffect, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'insightsphere-theme-preference';

interface UseThemeReturn {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

/**
 * Custom hook for managing application theme
 * Persists theme preference to local storage and loads it on mount
 */
export const useTheme = (): UseThemeReturn => {
  // Load saved theme preference or default to light
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      return 'light';
    }
  });

  // Save theme preference to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [mode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create Material-UI theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [mode]
  );

  return { theme, mode, toggleTheme };
};
