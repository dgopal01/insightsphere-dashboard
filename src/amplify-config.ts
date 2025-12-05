/**
 * Amplify Configuration and Initialization
 * This file configures AWS Amplify with authentication, API, and storage settings
 */

import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

/**
 * Configure Amplify with AWS services
 * This should be called once at application startup
 */
export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: awsconfig.aws_user_pools_id,
        userPoolClientId: awsconfig.aws_user_pools_web_client_id,
        identityPoolId: awsconfig.aws_cognito_identity_pool_id,
        loginWith: {
          email: true,
        },
      },
    },
    API: {
      GraphQL: {
        endpoint: awsconfig.aws_appsync_graphqlEndpoint,
        region: awsconfig.aws_appsync_region,
        defaultAuthMode: 'userPool',
      },
    },
    Storage: {
      S3: {
        bucket: awsconfig.aws_user_files_s3_bucket,
        region: awsconfig.aws_user_files_s3_bucket_region,
      },
    },
  });
  
  console.log('Amplify configured with Identity Pool:', awsconfig.aws_cognito_identity_pool_id);
};
