/**
 * AWS Amplify Configuration
 * Configures AWS services for the application
 */

import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'us-east-1_placeholder',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'placeholder',
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || 'us-east-1:placeholder'
    }
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://placeholder.appsync-api.us-east-1.amazonaws.com/graphql',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool' as const
    }
  }
};

export const configureAmplify = () => {
  try {
    Amplify.configure(amplifyConfig);
    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
};