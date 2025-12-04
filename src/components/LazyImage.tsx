/**
 * LazyImage Component
 * Implements lazy loading for images to improve performance
 * Requirements: 9.2
 */

import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react';
import { Box, Skeleton } from '@mui/material';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholderHeight?: number;
}

/**
 * LazyImage component with native lazy loading and fallback
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholderHeight = 200,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Check if image is already cached
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError) {
    return (
      <Box
        sx={{
          width: width || '100%',
          height: height || placeholderHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'action.hover',
          color: 'text.secondary',
          borderRadius: 1,
        }}
      >
        Failed to load image
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: width || '100%', height: height || 'auto' }}>
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          width={width || '100%'}
          height={height || placeholderHeight}
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: width || '100%',
          height: height || 'auto',
          display: isLoaded ? 'block' : 'none',
          objectFit: 'cover',
        }}
        {...props}
      />
    </Box>
  );
};
