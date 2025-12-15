# Backend Configuration

This project uses **CloudFormation** for backend infrastructure, not Amplify CLI.

## Backend Resources (CloudFormation)

The backend is deployed via CloudFormation stack: `insightsphere-dev`

Resources include:
- Cognito User Pool (Authentication)
- AppSync GraphQL API
- DynamoDB Tables (ChatLog, Feedback)
- S3 Bucket (Exports)
- IAM Roles

## Deployment

Backend: `./deploy.sh "your-email@example.com"`
Frontend: Deployed via AWS Amplify Hosting (this repo)

## Configuration

Environment variables are set in Amplify Console, not in amplify CLI.
See `QUICK_AMPLIFY_SETUP.txt` for the required environment variables.

## Why Not Amplify CLI?

We use CloudFormation for:
- Better infrastructure control
- Easier team collaboration
- Version control of infrastructure
- Integration with existing AWS resources
