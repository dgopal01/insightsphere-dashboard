/**
 * LoadingSpinner Component
 * Reusable loading indicator with consistent styling
 * Provides accessible loading states with customizable size and message
 */

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 60,
};

/**
 * LoadingSpinner component
 * Displays a circular progress indicator with optional message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  fullScreen = false,
}) => {
  const spinnerSize = sizeMap[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        minHeight: fullScreen ? '100vh' : 'auto',
        padding: 3,
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CircularProgress
        size={spinnerSize}
        aria-label={message || 'Loading'}
        sx={{
          color: 'primary.main',
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          aria-live="polite"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};
