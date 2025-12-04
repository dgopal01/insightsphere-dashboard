/**
 * AWS Amplify Configuration
 * Uses environment variables set in Amplify Console or .env file
 */

const awsconfig = {
  aws_project_region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  aws_cognito_region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  aws_user_pools_id: import.meta.env.VITE_USER_POOL_ID || '',
  aws_user_pools_web_client_id: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
  aws_cognito_identity_pool_id: import.meta.env.VITE_IDENTITY_POOL_ID || '',
  aws_appsync_graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || '',
  aws_appsync_region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS' as const,
  aws_user_files_s3_bucket: import.meta.env.VITE_S3_BUCKET || '',
  aws_user_files_s3_bucket_region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
};

// Log configuration in development (helps with debugging)
if (import.meta.env.DEV) {
  console.log('AWS Config:', {
    region: awsconfig.aws_project_region,
    userPoolId: awsconfig.aws_user_pools_id,
    hasClientId: !!awsconfig.aws_user_pools_web_client_id,
    hasGraphQLEndpoint: !!awsconfig.aws_appsync_graphqlEndpoint,
  });
}

export default awsconfig;
