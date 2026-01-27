/**
 * DynamoDB Service
 * Access DynamoDB through Lambda API using IAM roles
 */

// API endpoint for Lambda function
const API_ENDPOINT = import.meta.env.VITE_DYNAMODB_API_ENDPOINT || 'https://your-api-gateway-url.amazonaws.com/prod/dynamodb';

/**
 * Call Lambda API for DynamoDB operations
 */
async function callDynamoDBAPI(action: string, table: string, params: any = {}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        table,
        ...params
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('DynamoDB API error:', error);
    throw error;
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
 * List chat logs from DynamoDB via Lambda API
 */
export async function listChatLogs(limit: number = 50): Promise<{
  items: ChatLogEntry[];
  lastEvaluatedKey?: any;
}> {
  try {
    console.log('Fetching chat logs via Lambda API');
    const response = await callDynamoDBAPI('scan', 'chatLogs', { limit });
    console.log(`Successfully fetched ${response.items?.length || 0} chat logs`);
    return response;
  } catch (error: any) {
    console.error('Error listing chat logs:', error);
    throw new Error(`Failed to list chat logs: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * List feedback logs from DynamoDB via Lambda API
 */
export async function listFeedbackLogs(limit: number = 50): Promise<{
  items: FeedbackLogEntry[];
  lastEvaluatedKey?: any;
}> {
  try {
    console.log('Fetching feedback logs via Lambda API');
    const response = await callDynamoDBAPI('scan', 'feedbackLogs', { limit });
    console.log(`Successfully fetched ${response.items?.length || 0} feedback logs`);
    return response;
  } catch (error: any) {
    console.error('Error listing feedback logs:', error);
    throw new Error(`Failed to list feedback logs: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Update chat log review fields - Not implemented via API yet
 */
export async function updateChatLogReview(
  _logId: string,
  _timestamp: string,
  _revComment?: string,
  _revFeedback?: string,
  _issueTags?: string[]
): Promise<ChatLogEntry> {
  throw new Error('Update operations not implemented via Lambda API yet');
}

/**
 * Update feedback log review fields - Not implemented via API yet
 */
export async function updateFeedbackLogReview(
  _id: string,
  _datetime: string,
  _revComment?: string,
  _revFeedback?: string
): Promise<FeedbackLogEntry> {
  throw new Error('Update operations not implemented via Lambda API yet');
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
 * List AI evaluation jobs from DynamoDB via Lambda API
 */
export async function listAIEvaluationJobs(limit: number = 100): Promise<{
  items: AIEvaluationJobEntry[];
  lastEvaluatedKey?: any;
}> {
  try {
    console.log('Fetching AI evaluation jobs via Lambda API');
    const response = await callDynamoDBAPI('scan', 'evalJobs', { limit });
    console.log(`Successfully fetched ${response.items?.length || 0} AI evaluation jobs`);
    return response;
  } catch (error: any) {
    console.error('Error listing AI evaluation jobs:', error);
    throw new Error(`Failed to list AI evaluation jobs: ${error?.message || 'Unknown error'}`);
  }
}