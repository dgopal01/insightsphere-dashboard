/**
 * Lambda Function for DynamoDB Access
 * Uses IAM roles to access DynamoDB tables
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
  chatLogs: process.env.CHATLOG_TABLE || 'UnityAIAssistantLogs',
  feedbackLogs: process.env.FEEDBACK_TABLE || 'userFeedback',
  evalJobs: process.env.EVAL_JOB_TABLE || 'UnityAIAssistantEvalJob'
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, table, limit = 50 } = JSON.parse(event.body || '{}');

    if (action === 'scan') {
      const tableName = TABLES[table];
      if (!tableName) {
        throw new Error(`Invalid table: ${table}`);
      }

      const command = new ScanCommand({
        TableName: tableName,
        Limit: limit
      });

      const response = await docClient.send(command);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          items: response.Items || [],
          lastEvaluatedKey: response.LastEvaluatedKey
        })
      };
    }

    throw new Error(`Unsupported action: ${action}`);

  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};