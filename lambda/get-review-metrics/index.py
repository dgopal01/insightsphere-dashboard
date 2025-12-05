"""
Lambda function to calculate review metrics for chat logs and feedback logs.

This function scans both DynamoDB tables (UnityAIAssistantLogs and UserFeedback)
and calculates:
- Total count of entries
- Count of reviewed entries (entries with rev_comment OR rev_feedback)
- Count of pending entries (entries with empty rev_comment AND rev_feedback)

Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
"""

import json
import boto3
import os
from typing import Dict, List, Any


dynamodb = boto3.resource('dynamodb')


def is_reviewed(item: Dict[str, Any]) -> bool:
    """
    Determine if an item has been reviewed.
    
    An item is considered reviewed if either rev_comment OR rev_feedback
    is not empty (after stripping whitespace).
    
    Args:
        item: DynamoDB item containing rev_comment and rev_feedback fields
        
    Returns:
        True if the item has been reviewed, False otherwise
        
    Validates: Requirements 8.2, 8.5
    """
    rev_comment = item.get('rev_comment', '')
    rev_feedback = item.get('rev_feedback', '')
    
    # Check if either field has non-empty content after stripping whitespace
    has_comment = bool(rev_comment and str(rev_comment).strip())
    has_feedback = bool(rev_feedback and str(rev_feedback).strip())
    
    return has_comment or has_feedback


def scan_table_with_pagination(table, projection_expression: str) -> List[Dict[str, Any]]:
    """
    Scan a DynamoDB table with automatic pagination handling.
    
    Args:
        table: DynamoDB table resource
        projection_expression: Fields to retrieve from the table
        
    Returns:
        List of all items from the table
    """
    items = []
    
    # Initial scan
    response = table.scan(ProjectionExpression=projection_expression)
    items.extend(response.get('Items', []))
    
    # Handle pagination
    while 'LastEvaluatedKey' in response:
        response = table.scan(
            ProjectionExpression=projection_expression,
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response.get('Items', []))
    
    return items


def calculate_metrics(items: List[Dict[str, Any]]) -> tuple[int, int, int]:
    """
    Calculate total, reviewed, and pending counts for a list of items.
    
    Args:
        items: List of DynamoDB items
        
    Returns:
        Tuple of (total_count, reviewed_count, pending_count)
        
    Validates: Requirements 8.2, 8.3, 8.5, 8.6
    """
    total_count = len(items)
    reviewed_count = sum(1 for item in items if is_reviewed(item))
    pending_count = total_count - reviewed_count
    
    return total_count, reviewed_count, pending_count


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler function to calculate review metrics.
    
    Environment Variables:
        CHAT_LOGS_TABLE: Name of the UnityAIAssistantLogs DynamoDB table
        FEEDBACK_TABLE: Name of the UserFeedback DynamoDB table
        
    Returns:
        API Gateway response with metrics data
        
    Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
    """
    try:
        # Get table names from environment variables
        chat_logs_table_name = os.environ['CHAT_LOGS_TABLE']
        feedback_table_name = os.environ['FEEDBACK_TABLE']
        
        # Get table resources
        chat_logs_table = dynamodb.Table(chat_logs_table_name)
        feedback_table = dynamodb.Table(feedback_table_name)
        
        # Scan chat logs table - only fetch fields needed for metrics calculation
        # Requirement 8.1: Calculate total count of chat logs
        chat_logs_items = scan_table_with_pagination(
            chat_logs_table,
            'log_id, rev_comment, rev_feedback'
        )
        
        # Scan feedback table - only fetch fields needed for metrics calculation
        # Requirement 8.4: Calculate total count of feedback logs
        feedback_items = scan_table_with_pagination(
            feedback_table,
            'id, rev_comment, rev_feedback'
        )
        
        # Calculate chat logs metrics
        # Requirements 8.1, 8.2, 8.3
        total_chat_logs, reviewed_chat_logs, pending_chat_logs = calculate_metrics(chat_logs_items)
        
        # Calculate feedback logs metrics
        # Requirements 8.4, 8.5, 8.6
        total_feedback_logs, reviewed_feedback_logs, pending_feedback_logs = calculate_metrics(feedback_items)
        
        # Return metrics
        return {
            'statusCode': 200,
            'body': json.dumps({
                'totalChatLogs': total_chat_logs,
                'reviewedChatLogs': reviewed_chat_logs,
                'pendingChatLogs': pending_chat_logs,
                'totalFeedbackLogs': total_feedback_logs,
                'reviewedFeedbackLogs': reviewed_feedback_logs,
                'pendingFeedbackLogs': pending_feedback_logs
            })
        }
        
    except KeyError as e:
        error_msg = f"Missing environment variable: {str(e)}"
        print(error_msg)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Configuration error',
                'message': error_msg
            })
        }
        
    except Exception as e:
        error_msg = f"Error calculating metrics: {str(e)}"
        print(error_msg)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Failed to calculate metrics',
                'message': str(e)
            })
        }
