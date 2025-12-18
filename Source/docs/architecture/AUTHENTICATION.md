# Authentication System Documentation

## Overview

The InsightSphere authentication system is built on AWS Cognito and provides secure user authentication with role-based access control (RBAC).

## Architecture

### Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages global authentication state
   - Provides authentication methods (signIn, signOut)
   - Handles automatic token refresh
   - Extracts and manages user roles

2. **useAuth Hook**
   - Custom React hook for accessing authentication state
   - Must be used within AuthProvider
   - Returns: user, isAuthenticated, isLoading, error, signIn, signOut, hasRole, refreshAuth

3. **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`)
   - Guards routes requiring authentication
   - Supports role-based access control
   - Redirects unauthenticated users to sign-in page
   - Redirects unauthorized users to unauthorized page

4. **SignInPage** (`src/pages/SignInPage.tsx`)
   - User interface for authentication
   - Integrates with AWS Cognito
   - Provides user-friendly error messages
   - Redirects to original destination after successful sign-in

5. **UnauthorizedPage** (`src/pages/UnauthorizedPage.tsx`)
   - Displayed when user lacks required permissions
   - Provides navigation options

## User Roles

The system supports two roles:

- **admin**: Full access to all features
- **viewer**: Read-only access (default role)

Roles are stored in Cognito user attributes as `custom:role` or `role`.

## Usage

### Protecting Routes

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Require authentication only
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>

// Require specific role
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Using Authentication in Components

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <p>Role: {user?.role}</p>
      {hasRole('admin') && <AdminPanel />}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Features

### Automatic Token Refresh

- Tokens expire after 1 hour
- System automatically refreshes tokens every 50 minutes
- User is signed out if refresh fails
- Error message displayed to user

### Error Handling

The system provides user-friendly error messages for common scenarios:

- Incorrect username or password
- User not found
- Account not confirmed
- Network errors
- Session expiration

### Security Features

1. **JWT Token Management**
   - Tokens stored securely by AWS Amplify
   - Automatic refresh before expiration
   - Secure transmission over HTTPS

2. **Role-Based Access Control**
   - Roles extracted from Cognito attributes
   - Admin role has access to all features
   - Viewer role has read-only access

3. **Route Protection**
   - Unauthenticated users redirected to sign-in
   - Unauthorized users redirected to error page
   - Original destination preserved for post-login redirect

## Configuration

Authentication is configured in `src/amplify-config.ts`:

```typescript
Auth: {
  Cognito: {
    userPoolId: awsconfig.aws_user_pools_id,
    userPoolClientId: awsconfig.aws_user_pools_web_client_id,
    loginWith: {
      email: true,
    },
  },
}
```

Environment variables required:
- `VITE_AWS_USER_POOL_ID`: Cognito User Pool ID
- `VITE_AWS_USER_POOL_CLIENT_ID`: Cognito App Client ID
- `VITE_AWS_REGION`: AWS Region

## Testing

To test the authentication system:

1. Ensure AWS Cognito is properly configured
2. Create test users with different roles
3. Test sign-in flow
4. Test protected routes
5. Test role-based access
6. Test token refresh
7. Test error scenarios

## Requirements Validation

This implementation satisfies the following requirements:

- **6.1**: Unauthenticated users redirected to login page
- **6.2**: Valid credentials authenticate user via AWS Cognito
- **6.3**: Automatic token refresh without requiring re-login
- **6.4**: Admin users have access to all features including user management
- **6.5**: Viewer users restricted to read-only access

## Future Enhancements

Potential improvements:

1. Multi-factor authentication (MFA)
2. Password reset functionality
3. User profile management
4. Session timeout warnings
5. Remember me functionality
6. Social sign-in providers
