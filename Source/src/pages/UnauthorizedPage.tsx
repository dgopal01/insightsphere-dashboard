/**
 * Unauthorized Page (New Design System)
 * Displayed when user doesn't have required permissions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldAlert className="size-16 text-destructive" />
            </div>

            {/* Title and Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Access Denied</h1>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </div>

            {/* Alert */}
            <Alert variant="destructive" className="text-left">
              <AlertTitle>Authorization Required</AlertTitle>
              <AlertDescription>
                Please contact your administrator if you believe this is an error.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => navigate('/')}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
