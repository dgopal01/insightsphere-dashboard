/**
 * Component exports
 * 
 * Note: Old Material-UI components have been archived to archive/components/
 * This file now exports only the new Tailwind CSS + Radix UI components
 */

// Core Components
export { ProtectedRoute } from './ProtectedRoute';
export { ErrorBoundary } from './ErrorBoundary';
export { 
  ErrorDisplay, 
  NetworkError, 
  AuthenticationError, 
  ValidationError, 
  ServerError 
} from './ErrorDisplay';

// Layout Components
export { NewLayout } from './layout/NewLayout';
export { AppSidebar } from './layout/AppSidebar';

// UI Components (Radix UI primitives)
export * from './ui/alert';
export * from './ui/badge';
export * from './ui/button';
export * from './ui/card';
export * from './ui/checkbox';
export * from './ui/dialog';
export * from './ui/input';
export * from './ui/label';
export * from './ui/progress';
export * from './ui/select';
export * from './ui/separator';
export * from './ui/sheet';
export * from './ui/sidebar';
export * from './ui/skeleton';
export * from './ui/table';
export * from './ui/tooltip';
