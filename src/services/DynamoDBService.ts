/**
 * DynamoDB Service
 * Direct access to DynamoDB tables using AWS credentials from environment
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Table names from environment variables
const CHAT_LOG_TABLE = import.meta.env.VITE_CHATLOG_TABLE || 'UnityAIAssistantLogs';
const FEEDBACK_TABLE = import.meta.env.VITE_FEEDBACK_TABLE || 'userFeedback';
const EVAL_JOB_TABLE = import.meta.env.VITE_EVAL_JOB_TABLE || 'UnityAIAssistantEvalJob';
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

/**
 * Get DynamoDB client with AWS credentials from environment
 */
async function getDynamoDBClient(): Promise<DynamoDBDocumentClient> {
  try {
    console.log('Creating DynamoDB client with AWS credentials');

    const client = new DynamoDBClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
        sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN || undefined,
      },
    });

    return DynamoDBDocumentClient.from(client);
  } catch (error) {
    console.error('Error getting DynamoDB client:', error);
    throw new Error(
      `Failed to get DynamoDB client: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
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
  issue_tags?: string[] | string;
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
  try {
    const client = await getDynamoDBClient();

    console.log('Fetching chat logs from table:', CHAT_LOG_TABLE);

    const command = new ScanCommand({
      TableName: CHAT_LOG_TABLE,
      Limit: limit,
    });

    const response = await client.send(command);

    console.log(`Successfully fetched ${response.Items?.length || 0} chat logs`);

    return {
      items: (response.Items as ChatLogEntry[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  } catch (error: any) {
    console.error('Error listing chat logs:', {
      error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.$metadata?.httpStatusCode,
      tableName: CHAT_LOG_TABLE,
    });
    throw new Error(`Failed to list chat logs: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * List feedback logs from DynamoDB
 */
export async function listFeedbackLogs(limit: number = 50): Promise<{
  items: FeedbackLogEntry[];
  lastEvaluatedKey?: any;
}> {
  try {
    const client = await getDynamoDBClient();

    console.log('Fetching feedback logs from table:', FEEDBACK_TABLE);

    const command = new ScanCommand({
      TableName: FEEDBACK_TABLE,
      Limit: limit,
    });

    const response = await client.send(command);

    console.log(`Successfully fetched ${response.Items?.length || 0} feedback logs`);

    return {
      items: (response.Items as FeedbackLogEntry[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  } catch (error: any) {
    console.error('Error listing feedback logs:', {
      error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.$metadata?.httpStatusCode,
      tableName: FEEDBACK_TABLE,
      stack: error?.stack,
    });
    throw new Error(`Failed to list feedback logs: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Update chat log review fields
 */
export async function updateChatLogReview(
  logId: string,
  timestamp: string,
  revComment?: string,
  revFeedback?: string,
  issueTags?: string[]
): Promise<ChatLogEntry> {
  try {
    const client = await getDynamoDBClient();

    const updateExpression: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeValues[':rev_comment'] = revComment || '';
    expressionAttributeNames['#rev_comment'] = 'rev_comment';

    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeValues[':rev_feedback'] = revFeedback || '';
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';

    if (issueTags !== undefined) {
      updateExpression.push('#issue_tags = :issue_tags');
      expressionAttributeValues[':issue_tags'] = JSON.stringify(issueTags);
      expressionAttributeNames['#issue_tags'] = 'issue_tags';
    }

    const updateParams = {
      TableName: CHAT_LOG_TABLE,
      Key: {
        log_id: logId,
        timestamp: timestamp,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW' as const,
    };

    const command = new UpdateCommand(updateParams);
    const response = await client.send(command);

    return response.Attributes as ChatLogEntry;
  } catch (error: any) {
    console.error('Error updating chat log:', error);
    throw new Error(`Failed to update chat log review: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Update feedback log review fields
 */
export async function updateFeedbackLogReview(
  id: string,
  datetime: string,
  revComment?: string,
  revFeedback?: string
): Promise<FeedbackLogEntry> {
  try {
    const client = await getDynamoDBClient();

    const updateExpression: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeValues[':rev_comment'] = revComment || '';
    expressionAttributeNames['#rev_comment'] = 'rev_comment';

    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeValues[':rev_feedback'] = revFeedback || '';
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';

    const updateParams = {
      TableName: FEEDBACK_TABLE,
      Key: {
        id: id,
        datetime: datetime,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW' as const,
    };

    const command = new UpdateCommand(updateParams);
    const response = await client.send(command);

    return response.Attributes as FeedbackLogEntry;
  } catch (error: any) {
    console.error('Error updating feedback log:', error);
    throw new Error(`Failed to update feedback review: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * AI Evaluation Job Entry interface matching DynamoDB structure
 */
export interface AIEvaluationJobEntry {
  log_id: string;
  job_id: string;
  job_arn: string;
  timestamp: string;
  knowledgeBaseIdentifier: string;
  prompt_text: string;
  output_text: string;
  reference_response_text: string;
  source_filename: string;
  citations_metadata?: Array<{
    carrier_alias_name?: string;
    carrier_name?: string;
    document_page_number?: string;
    kb_chunk_id?: string;
    kb_data_source_id?: string;
    source_uri?: string;
  }>;
  results?: Array<{
    explanation?: string;
    metricName?: string;
    modelIdentifier?: string;
    result?: number;
  }>;
}

/**
 * List AI evaluation jobs from DynamoDB
 */
export async function listAIEvaluationJobs(limit: number = 100): Promise<{
  items: AIEvaluationJobEntry[];
  lastEvaluatedKey?: any;
}> {
  try {
    const client = await getDynamoDBClient();

    console.log('Fetching AI evaluation jobs from table:', EVAL_JOB_TABLE);

    const command = new ScanCommand({
      TableName: EVAL_JOB_TABLE,
      Limit: limit,
    });

    const response = await client.send(command);

    console.log(`Successfully fetched ${response.Items?.length || 0} AI evaluation jobs`);

    return {
      items: (response.Items as AIEvaluationJobEntry[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  } catch (error: any) {
    console.error('Error listing AI evaluation jobs:', {
      error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.$metadata?.httpStatusCode,
      tableName: EVAL_JOB_TABLE,
    });
    throw new Error(`Failed to list AI evaluation jobs: ${error?.message || 'Unknown error'}`);
  }
}