#!/bin/sh

# Environment Configuration Script for Container Runtime
# This script runs at container startup to configure environment variables

set -e

echo "🔧 Configuring environment variables..."

# Create runtime config file for the frontend
cat > /usr/share/nginx/html/runtime-config.js << EOF
window.runtimeConfig = {
  VITE_ENV: "${VITE_ENV:-production}",
  VITE_AWS_REGION: "${VITE_AWS_REGION:-us-east-1}",
  VITE_USER_POOL_ID: "${VITE_USER_POOL_ID}",
  VITE_USER_POOL_CLIENT_ID: "${VITE_USER_POOL_CLIENT_ID}",
  VITE_IDENTITY_POOL_ID: "${VITE_IDENTITY_POOL_ID}",
  VITE_GRAPHQL_ENDPOINT: "${VITE_GRAPHQL_ENDPOINT}",
  VITE_GRAPHQL_API_ID: "${VITE_GRAPHQL_API_ID}",
  VITE_S3_BUCKET: "${VITE_S3_BUCKET}",
  VITE_CHATLOG_TABLE: "${VITE_CHATLOG_TABLE}",
  VITE_FEEDBACK_TABLE: "${VITE_FEEDBACK_TABLE}",
  VITE_EVAL_JOB_TABLE: "${VITE_EVAL_JOB_TABLE}",
  VITE_API_TIMEOUT: "${VITE_API_TIMEOUT:-30000}",
  VITE_API_RETRY_ATTEMPTS: "${VITE_API_RETRY_ATTEMPTS:-3}",
  VITE_ENABLE_ANALYTICS: "${VITE_ENABLE_ANALYTICS:-true}",
  VITE_ENABLE_ERROR_TRACKING: "${VITE_ENABLE_ERROR_TRACKING:-true}",
  VITE_ENABLE_PERFORMANCE_MONITORING: "${VITE_ENABLE_PERFORMANCE_MONITORING:-true}",
  VITE_SENTRY_DSN: "${VITE_SENTRY_DSN}",
  VITE_SENTRY_ENVIRONMENT: "${VITE_SENTRY_ENVIRONMENT:-production}",
  VITE_SENTRY_TRACES_SAMPLE_RATE: "${VITE_SENTRY_TRACES_SAMPLE_RATE:-0.1}",
  VITE_DEBUG_MODE: "${VITE_DEBUG_MODE:-false}",
  VITE_LOG_LEVEL: "${VITE_LOG_LEVEL:-error}"
};
EOF

echo "✅ Runtime configuration created"

# Validate required environment variables
REQUIRED_VARS="VITE_USER_POOL_ID VITE_USER_POOL_CLIENT_ID VITE_IDENTITY_POOL_ID VITE_GRAPHQL_ENDPOINT"

for var in $REQUIRED_VARS; do
  eval value=\$$var
  if [ -z "$value" ]; then
    echo "❌ Required environment variable $var is not set"
    exit 1
  fi
done

echo "✅ All required environment variables are configured"

# Update index.html to include runtime config
if [ -f "/usr/share/nginx/html/index.html" ]; then
  # Add runtime config script before closing head tag
  sed -i 's|</head>|  <script src="/runtime-config.js"></script>\n</head>|' /usr/share/nginx/html/index.html
  echo "✅ Runtime config script added to index.html"
fi

echo "🎉 Environment configuration completed successfully"