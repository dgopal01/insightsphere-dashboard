"""
Unit tests for the GetReviewMetrics Lambda function.

These tests verify the core logic of the metrics calculation without
requiring actual DynamoDB tables.
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
import json
import sys
import os

# Add the lambda directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from index import is_reviewed, calculate_metrics, scan_table_with_pagination, lambda_handler


class TestIsReviewed(unittest.TestCase):
    """Test the is_reviewed function."""
    
    def test_reviewed_with_comment_only(self):
        """Item with only rev_comment should be considered reviewed."""
        item = {'rev_comment': 'This is a comment', 'rev_feedback': ''}
        self.assertTrue(is_reviewed(item))
    
    def test_reviewed_with_feedback_only(self):
        """Item with only rev_feedback should be considered reviewed."""
        item = {'rev_comment': '', 'rev_feedback': 'This is feedback'}
        self.assertTrue(is_reviewed(item))
    
    def test_reviewed_with_both(self):
        """Item with both fields should be considered reviewed."""
        item = {'rev_comment': 'Comment', 'rev_feedback': 'Feedback'}
        self.assertTrue(is_reviewed(item))
    
    def test_not_reviewed_empty_strings(self):
        """Item with empty strings should not be considered reviewed."""
        item = {'rev_comment': '', 'rev_feedback': ''}
        self.assertFalse(is_reviewed(item))
    
    def test_not_reviewed_whitespace_only(self):
        """Item with only whitespace should not be considered reviewed."""
        item = {'rev_comment': '   ', 'rev_feedback': '  \n  '}
        self.assertFalse(is_reviewed(item))
    
    def test_not_reviewed_missing_fields(self):
        """Item with missing fields should not be considered reviewed."""
        item = {}
        self.assertFalse(is_reviewed(item))
    
    def test_reviewed_with_whitespace_and_content(self):
        """Item with whitespace and content should be considered reviewed."""
        item = {'rev_comment': '  Valid comment  ', 'rev_feedback': ''}
        self.assertTrue(is_reviewed(item))


class TestCalculateMetrics(unittest.TestCase):
    """Test the calculate_metrics function."""
    
    def test_empty_list(self):
        """Empty list should return zero counts."""
        total, reviewed, pending = calculate_metrics([])
        self.assertEqual(total, 0)
        self.assertEqual(reviewed, 0)
        self.assertEqual(pending, 0)
    
    def test_all_reviewed(self):
        """All reviewed items should have pending count of zero."""
        items = [
            {'rev_comment': 'Comment 1', 'rev_feedback': ''},
            {'rev_comment': '', 'rev_feedback': 'Feedback 2'},
            {'rev_comment': 'Comment 3', 'rev_feedback': 'Feedback 3'},
        ]
        total, reviewed, pending = calculate_metrics(items)
        self.assertEqual(total, 3)
        self.assertEqual(reviewed, 3)
        self.assertEqual(pending, 0)
    
    def test_all_pending(self):
        """All pending items should have reviewed count of zero."""
        items = [
            {'rev_comment': '', 'rev_feedback': ''},
            {'rev_comment': '  ', 'rev_feedback': '  '},
            {},
        ]
        total, reviewed, pending = calculate_metrics(items)
        self.assertEqual(total, 3)
        self.assertEqual(reviewed, 0)
        self.assertEqual(pending, 3)
    
    def test_mixed_status(self):
        """Mixed reviewed and pending items should be counted correctly."""
        items = [
            {'rev_comment': 'Reviewed', 'rev_feedback': ''},
            {'rev_comment': '', 'rev_feedback': ''},
            {'rev_comment': '', 'rev_feedback': 'Also reviewed'},
            {'rev_comment': '  ', 'rev_feedback': '  '},
        ]
        total, reviewed, pending = calculate_metrics(items)
        self.assertEqual(total, 4)
        self.assertEqual(reviewed, 2)
        self.assertEqual(pending, 2)


class TestScanTableWithPagination(unittest.TestCase):
    """Test the scan_table_with_pagination function."""
    
    def test_single_page(self):
        """Single page scan should return all items."""
        mock_table = Mock()
        mock_table.scan.return_value = {
            'Items': [{'id': '1'}, {'id': '2'}]
        }
        
        items = scan_table_with_pagination(mock_table, 'id')
        
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['id'], '1')
        self.assertEqual(items[1]['id'], '2')
        mock_table.scan.assert_called_once()
    
    def test_multiple_pages(self):
        """Multiple page scan should return all items from all pages."""
        mock_table = Mock()
        mock_table.scan.side_effect = [
            {
                'Items': [{'id': '1'}, {'id': '2'}],
                'LastEvaluatedKey': {'id': '2'}
            },
            {
                'Items': [{'id': '3'}, {'id': '4'}],
                'LastEvaluatedKey': {'id': '4'}
            },
            {
                'Items': [{'id': '5'}]
            }
        ]
        
        items = scan_table_with_pagination(mock_table, 'id')
        
        self.assertEqual(len(items), 5)
        self.assertEqual(mock_table.scan.call_count, 3)


class TestLambdaHandler(unittest.TestCase):
    """Test the lambda_handler function."""
    
    @patch('index.dynamodb')
    @patch.dict(os.environ, {
        'CHAT_LOGS_TABLE': 'test-chat-logs',
        'FEEDBACK_TABLE': 'test-feedback'
    })
    def test_successful_execution(self, mock_dynamodb):
        """Successful execution should return correct metrics."""
        # Mock chat logs table
        mock_chat_table = Mock()
        mock_chat_table.scan.return_value = {
            'Items': [
                {'log_id': '1', 'rev_comment': 'Reviewed', 'rev_feedback': ''},
                {'log_id': '2', 'rev_comment': '', 'rev_feedback': ''},
            ]
        }
        
        # Mock feedback table
        mock_feedback_table = Mock()
        mock_feedback_table.scan.return_value = {
            'Items': [
                {'id': '1', 'rev_comment': '', 'rev_feedback': 'Reviewed'},
                {'id': '2', 'rev_comment': '', 'rev_feedback': ''},
                {'id': '3', 'rev_comment': 'Reviewed', 'rev_feedback': ''},
            ]
        }
        
        # Configure mock dynamodb
        mock_dynamodb.Table.side_effect = [mock_chat_table, mock_feedback_table]
        
        # Execute handler
        result = lambda_handler({}, None)
        
        # Verify response
        self.assertEqual(result['statusCode'], 200)
        body = json.loads(result['body'])
        self.assertEqual(body['totalChatLogs'], 2)
        self.assertEqual(body['reviewedChatLogs'], 1)
        self.assertEqual(body['pendingChatLogs'], 1)
        self.assertEqual(body['totalFeedbackLogs'], 3)
        self.assertEqual(body['reviewedFeedbackLogs'], 2)
        self.assertEqual(body['pendingFeedbackLogs'], 1)
    
    @patch.dict(os.environ, {}, clear=True)
    def test_missing_environment_variables(self):
        """Missing environment variables should return error."""
        result = lambda_handler({}, None)
        
        self.assertEqual(result['statusCode'], 500)
        body = json.loads(result['body'])
        self.assertEqual(body['error'], 'Configuration error')
    
    @patch('index.dynamodb')
    @patch.dict(os.environ, {
        'CHAT_LOGS_TABLE': 'test-chat-logs',
        'FEEDBACK_TABLE': 'test-feedback'
    })
    def test_dynamodb_error(self, mock_dynamodb):
        """DynamoDB errors should be handled gracefully."""
        mock_table = Mock()
        mock_table.scan.side_effect = Exception('DynamoDB error')
        mock_dynamodb.Table.return_value = mock_table
        
        result = lambda_handler({}, None)
        
        self.assertEqual(result['statusCode'], 500)
        body = json.loads(result['body'])
        self.assertEqual(body['error'], 'Failed to calculate metrics')


if __name__ == '__main__':
    unittest.main()
