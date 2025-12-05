/**
 * DynamoDB Service
 * Direct access to DynamoDB tables bypassing AppSync
 * Temporary solution until AppSync schema is fixed
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from 'aws-amplify/auth';

// Table names from environment variables
const CHAT_LOG_TABLE = import.meta.env.VITE_CHATLOG_TABLE || 'UnityAIAssistantLogs';
const FEEDBACK_TABLE = import.meta.env.VITE_FEEDBACK_TABLE || 'userFeedback';
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

/**
 * Get DynamoDB client with Cognito credentials
 */
async function getDynamoDBClient(): Promise<DynamoDBDocumentClient> {
  const session = await fetchAuthSession();
  const credentials = session.credentials;

  if (!credentials) {
    throw new Error('No credentials available');
  }

  const client = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  return DynamoDBDocumentClient.from(client);
}

/**
 * Chat Log Entry interface matching DynamoDB structure
 */
export interface ChatLogEntry {
  log_id: string;
  timestamp: string;
  carrier_name?: string;
  chat_id?: string;
  citation?: string;
  fi_name?: string;
  guardrail_id?: string;
  guardrail_intervened?: boolean;
  model_id?: string;
  question?: string;
  response?: string;
  rev_comment?: string;
  rev_feedback?: string;
  session_id?: string;
  user_name?: string;
  usr_comment?: string;
  usr_feedback?: string;
}

/**
 * Feedback Log Entry interface matching DynamoDB structure
 */
export interface FeedbackLogEntry {
  id: string;
  datetime: string;
  info?: {
    carrier?: string;
    feedback?: string;
    comments?: string;
    question?: string;
    response?: string;
    user_name?: string;
    session_id?: string;
    type?: string;
    username?: string;
  };
  rev_comment?: string;
  rev_feedback?: string;
}

/**
 * List chat logs from DynamoDB
 */
export async function listChatLogs(limit: number = 50): Promise<{
  items: ChatLogEntry[];
  lastEvaluatedKey?: any;
}> {
  const client = await getDynamoDBClient();

  const command = new ScanCommand({
    TableName: CHAT_LOG_TABLE,
    Limit: limit,
  });

  const response = await client.send(command);

  return {
    items: (response.Items as ChatLogEntry[]) || [],
    lastEvaluatedKey: response.LastEvaluatedKey,
  };
}

/**
 * List feedback logs from DynamoDB
 */
export async function listFeedbackLogs(limit: number = 50): Promise<{
  items: FeedbackLogEntry[];
  lastEvaluatedKey?: any;
}> {
  const client = await getDynamoDBClient();

  const command = new ScanCommand({
    TableName: FEEDBACK_TABLE,
    Limit: limit,
  });

  const response = await client.send(command);

  return {
    items: (response.Items as FeedbackLogEntry[]) || [],
    lastEvaluatedKey: response.LastEvaluatedKey,
  };
}

/**
 * Update chat log review fields
 */
export async function updateChatLogReview(
  logId: string,
  revComment?: string,
  revFeedback?: string
): Promise<ChatLogEntry> {
  const client = await getDynamoDBClient();

  const updateExpression: string[] = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};

  if (revComment !== undefined) {
    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeValues[':rev_comment'] = revComment;
    expressionAttributeNames['#rev_comment'] = 'rev_comment';
  }

  if (revFeedback !== undefined) {
    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeValues[':rev_feedback'] = revFeedback;
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';
  }

  const command = new UpdateCommand({
    TableName: CHAT_LOG_TABLE,
    Key: { log_id: logId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW',
  });

  const response = await client.send(command);
  return response.Attributes as ChatLogEntry;
}

/**
 * Update feedback log review fields
 */
export async function updateFeedbackLogReview(
  id: string,
  revComment?: string,
  revFeedback?: string
): Promise<FeedbackLogEntry> {
  const client = await getDynamoDBClient();

  const updateExpression: string[] = [];
  const expressionAttributeValues: any = {};
  const expressionAttributeNames: any = {};

  if (revComment !== undefined) {
    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeValues[':rev_comment'] = revComment;
    expressionAttributeNames['#rev_comment'] = 'rev_comment';
  }

  if (revFeedback !== undefined) {
    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeValues[':rev_feedback'] = revFeedback;
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';
  }

  // Note: userFeedback table has composite key (id, datetime)
  // We need to get the datetime first
  const getCommand = new ScanCommand({
    TableName: FEEDBACK_TABLE,
    FilterExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    },
    Limit: 1,
  });

  const getResponse = await client.send(getCommand);
  if (!getResponse.Items || getResponse.Items.length === 0) {
    throw new Error(`Feedback log not found: ${id}`);
  }

  const existingItem = getResponse.Items[0] as FeedbackLogEntry;

  const command = new UpdateCommand({
    TableName: FEEDBACK_TABLE,
    Key: {
      id: id,
      datetime: existingItem.datetime,
    },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW',
  });

  const response = await client.send(command);
  return response.Attributes as FeedbackLogEntry;
}

