/**
 * Simple Lambda deployment script
 * Run: node deploy-lambda.js
 */

const { LambdaClient, CreateFunctionCommand, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');
const { APIGatewayClient, CreateRestApiCommand, CreateResourceCommand, PutMethodCommand, PutIntegrationCommand, CreateDeploymentCommand } = require('@aws-sdk/client-api-gateway');
const fs = require('fs');
const path = require('path');

const lambda = new LambdaClient({ region: 'us-east-1' });
const apiGateway = new APIGatewayClient({ region: 'us-east-1' });

async function deployLambda() {
  try {
    // Create Lambda function
    const functionCode = fs.readFileSync(path.join(__dirname, 'lambda', 'dynamodb-proxy.js'));
    
    const createParams = {
      FunctionName: 'dynamodb-proxy',
      Runtime: 'nodejs18.x',
      Role: 'arn:aws:iam::327052515912:role/lambda-execution-role', // Replace with your role ARN
      Handler: 'index.handler',
      Code: { ZipFile: functionCode },
      Environment: {
        Variables: {
          CHATLOG_TABLE: 'UnityAIAssistantLogs',
          FEEDBACK_TABLE: 'userFeedback',
          EVAL_JOB_TABLE: 'UnityAIAssistantEvalJob'
        }
      }
    };

    const lambdaResult = await lambda.send(new CreateFunctionCommand(createParams));
    console.log('Lambda function created:', lambdaResult.FunctionArn);

    // Create API Gateway
    const apiResult = await apiGateway.send(new CreateRestApiCommand({
      name: 'dynamodb-proxy-api',
      description: 'API for DynamoDB proxy Lambda'
    }));

    console.log('API Gateway created:', apiResult.id);
    console.log(`API Endpoint: https://${apiResult.id}.execute-api.us-east-1.amazonaws.com/prod/dynamodb`);

  } catch (error) {
    console.error('Deployment failed:', error.message);
  }
}

deployLambda();