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

// Log configuration for debugging (safe for production - no sensitive data)
console.log('AWS Config Status:', {
  region: awsconfig.aws_project_region,
  hasUserPoolId: !!awsconfig.aws_user_pools_id,
  userPoolIdPrefix: awsconfig.aws_user_pools_id
    ? awsconfig.aws_user_pools_id.substring(0, 10) + '...'
    : 'MISSING',
  hasClientId: !!awsconfig.aws_user_pools_web_client_id,
  hasIdentityPoolId: !!awsconfig.aws_cognito_identity_pool_id,
  hasGraphQLEndpoint: !!awsconfig.aws_appsync_graphqlEndpoint,
  hasS3Bucket: !!awsconfig.aws_user_files_s3_bucket,
  environment: import.meta.env.VITE_ENV || 'not set',
});

// Validate required configuration
if (!awsconfig.aws_user_pools_id || !awsconfig.aws_user_pools_web_client_id) {
  console.error('❌ AWS Configuration Error: Missing required Cognito configuration');
  console.error('Required environment variables:');
  console.error('  - VITE_USER_POOL_ID:', awsconfig.aws_user_pools_id ? '✓' : '✗ MISSING');
  console.error(
    '  - VITE_USER_POOL_CLIENT_ID:',
    awsconfig.aws_user_pools_web_client_id ? '✓' : '✗ MISSING'
  );
}

export default awsconfig;