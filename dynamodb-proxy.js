/**
 * Lambda Function for DynamoDB Access
 * Handles read and write operations for chat logs and feedback logs
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
    const { action, table, ...params } = JSON.parse(event.body || '{}');

    if (action === 'scan') {
      return await handleScan(table, params, headers);
    }

    if (action === 'updateChatLog') {
      return await handleUpdateChatLog(params, headers);
    }

    if (action === 'updateFeedbackLog') {
      return await handleUpdateFeedbackLog(params, headers);
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

/**
 * Handle scan operations for listing data
 */
async function handleScan(table, params, headers) {
  const tableName = TABLES[table];
  if (!tableName) {
    throw new Error(`Invalid table: ${table}`);
  }

  const command = new ScanCommand({
    TableName: tableName,
    Limit: params.limit || 50
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

/**
 * Handle chat log review updates
 * Updates: rev_comment, rev_feedback, issue_tags
 */
async function handleUpdateChatLog(params, headers) {
  const { log_id, timestamp, rev_comment, rev_feedback, issue_tags } = params;

  if (!log_id || !timestamp) {
    throw new Error('log_id and timestamp are required for chat log updates');
  }

  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (rev_comment !== undefined) {
    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeNames['#rev_comment'] = 'rev_comment';
    expressionAttributeValues[':rev_comment'] = rev_comment;
  }

  if (rev_feedback !== undefined) {
    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';
    expressionAttributeValues[':rev_feedback'] = rev_feedback;
  }

  if (issue_tags !== undefined) {
    updateExpression.push('#issue_tags = :issue_tags');
    expressionAttributeNames['#issue_tags'] = 'issue_tags';
    expressionAttributeValues[':issue_tags'] = JSON.stringify(issue_tags);
  }

  if (updateExpression.length === 0) {
    throw new Error('No fields to update');
  }

  const command = new UpdateCommand({
    TableName: TABLES.chatLogs,
    Key: { log_id, timestamp },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  });

  const response = await docClient.send(command);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response.Attributes)
  };
}

/**
 * Handle feedback log review updates
 * Updates: rev_comment, rev_feedback
 */
async function handleUpdateFeedbackLog(params, headers) {
  const { id, datetime, rev_comment, rev_feedback } = params;

  if (!id || !datetime) {
    throw new Error('id and datetime are required for feedback log updates');
  }

  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (rev_comment !== undefined) {
    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeNames['#rev_comment'] = 'rev_comment';
    expressionAttributeValues[':rev_comment'] = rev_comment;
  }

  if (rev_feedback !== undefined) {
    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';
    expressionAttributeValues[':rev_feedback'] = rev_feedback;
  }

  if (updateExpression.length === 0) {
    throw new Error('No fields to update');
  }

  const command = new UpdateCommand({
    TableName: TABLES.feedbackLogs,
    Key: { id, datetime },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  });

  const response = await docClient.send(command);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response.Attributes)
  };
}