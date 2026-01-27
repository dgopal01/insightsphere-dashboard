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
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || 'us-east-1:placeholder',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_OAUTH_DOMAIN || 'placeholder.auth.us-east-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [window.location.origin],
          redirectSignOut: [window.location.origin],
          responseType: 'code'
        }
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://placeholder.appsync-api.us-east-1.amazonaws.com/graphql',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool'
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