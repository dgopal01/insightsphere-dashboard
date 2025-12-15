/**
 * AI Metrics Types
 * Types for UnityAIAssistantEvalJob DynamoDB table
 */

export interface CitationMetadata {
  carrier_alias_name: string;
  carrier_name: string;
  document_page_number: string;
  kb_chunk_id: string;
  kb_data_source_id: string;
  source_uri: string;
}

export interface MetricResult {
  explanation: string;
  metricName: string;
  modelIdentifier: string;
  result: number;
}

export interface AIEvaluationJob {
  log_id: string;
  job_id: string;
  job_arn: string;
  timestamp: string;
  knowledgeBaseIdentifier: string;
  prompt_text: string;
  output_text: string;
  reference_response_text: string;
  source_filename: string;
  citations_metadata: CitationMetadata[];
  results: MetricResult[];
}

export interface MetricsSummary {
  totalConversations: number;
  pendingReviews: number;
  averageCorrectness: number;
  averageHelpfulness: number;
  averageFaithfulness: number;
  averageHarmfulness: number;
  averageStereotyping: number;
  correctnessChange: number;
  helpfulnessChange: number;
  faithfulnessChange: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}
