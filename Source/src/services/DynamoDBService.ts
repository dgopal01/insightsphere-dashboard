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
const EVAL_JOB_TABLE = import.meta.env.VITE_EVAL_JOB_TABLE || 'UnityAIAssistantEvalJob';
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

/**
 * Get DynamoDB client with Cognito credentials
 */
async function getDynamoDBClient(): Promise<DynamoDBDocumentClient> {
  try {
    const session = await fetchAuthSession();

    // Check if we have credentials
    if (!session.credentials) {
      console.error('No credentials in session:', session);
      throw new Error(
        'No credentials available. Please ensure you are signed in and the Identity Pool is configured.'
      );
    }

    const credentials = session.credentials;

    console.log('Creating DynamoDB client with credentials from:', {
      identityId: session.identityId,
      hasAccessKey: !!credentials.accessKeyId,
      hasSecretKey: !!credentials.secretAccessKey,
      hasSessionToken: !!credentials.sessionToken,
    });

    const client = new DynamoDBClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
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

    // Log first item to verify structure
    if (response.Items && response.Items.length > 0) {
      console.log('Sample feedback log (raw):', JSON.stringify(response.Items[0], null, 2));
      console.log('Sample feedback log info field:', response.Items[0].info);
    }

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
 * Note: UnityAIAssistantLogs table has composite key (log_id + timestamp)
 * @param logId - The partition key (log_id) for the chat log
 * @param timestamp - The sort key (timestamp) for the chat log
 * @param revComment - Review comment to set
 * @param revFeedback - Review feedback to set
 * @param issueTags - Array of issue tags to set
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

    console.log('Updating chat log with params:', {
      table: CHAT_LOG_TABLE,
      logId,
      timestamp,
      revComment,
      revFeedback,
      issueTags,
    });

    // Build update expression
    const updateExpression: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    // Always set both fields to ensure they exist
    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeValues[':rev_comment'] = revComment || '';
    expressionAttributeNames['#rev_comment'] = 'rev_comment';

    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeValues[':rev_feedback'] = revFeedback || '';
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';

    // Add issue_tags if provided
    if (issueTags !== undefined) {
      updateExpression.push('#issue_tags = :issue_tags');
      expressionAttributeValues[':issue_tags'] = JSON.stringify(issueTags);
      expressionAttributeNames['#issue_tags'] = 'issue_tags';
    }

    // Update using composite key (log_id + timestamp)
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

    console.log(
      'DynamoDB UpdateCommand params for chat log:',
      JSON.stringify(updateParams, null, 2)
    );

    const command = new UpdateCommand(updateParams);
    const response = await client.send(command);

    console.log('Chat log update successful:', response.Attributes);
    return response.Attributes as ChatLogEntry;
  } catch (error: any) {
    console.error('Error updating chat log:', {
      error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.$metadata?.httpStatusCode,
      requestId: error?.$metadata?.requestId,
    });

    if (error?.name === 'ValidationException') {
      throw new Error(
        `DynamoDB validation error: ${error.message}. Check that log_id="${logId}" and timestamp="${timestamp}" are correct.`
      );
    }

    throw new Error(`Failed to update chat log review: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Update feedback log review fields
 * Note: userFeedback table has composite key (id + datetime)
 * @param id - The partition key (id) for the feedback log
 * @param datetime - The sort key (datetime) for the feedback log
 * @param revComment - Review comment to set
 * @param revFeedback - Review feedback to set
 */
export async function updateFeedbackLogReview(
  id: string,
  datetime: string,
  revComment?: string,
  revFeedback?: string
): Promise<FeedbackLogEntry> {
  try {
    const client = await getDynamoDBClient();

    console.log('Updating feedback log with params:', {
      table: FEEDBACK_TABLE,
      id,
      datetime,
      revComment,
      revFeedback,
    });

    // Build update expression
    const updateExpression: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    // Always set both fields to ensure they exist
    updateExpression.push('#rev_comment = :rev_comment');
    expressionAttributeValues[':rev_comment'] = revComment || '';
    expressionAttributeNames['#rev_comment'] = 'rev_comment';

    updateExpression.push('#rev_feedback = :rev_feedback');
    expressionAttributeValues[':rev_feedback'] = revFeedback || '';
    expressionAttributeNames['#rev_feedback'] = 'rev_feedback';

    // Update using composite key (id + datetime)
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

    console.log('DynamoDB UpdateCommand params:', JSON.stringify(updateParams, null, 2));

    const command = new UpdateCommand(updateParams);
    const response = await client.send(command);

    console.log('Update successful:', response.Attributes);
    return response.Attributes as FeedbackLogEntry;
  } catch (error: any) {
    console.error('Error updating feedback log:', {
      error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.$metadata?.httpStatusCode,
      requestId: error?.$metadata?.requestId,
    });

    // Provide more helpful error message
    if (error?.name === 'ValidationException') {
      throw new Error(
        `DynamoDB validation error: ${error.message}. Check that id="${id}" and datetime="${datetime}" are correct.`
      );
    }

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
