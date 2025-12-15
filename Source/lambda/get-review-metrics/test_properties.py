"""
Property-based tests for the GetReviewMetrics Lambda function.

These tests use Hypothesis to verify universal properties that should hold
across all valid inputs, ensuring correctness of the metrics calculation logic.

**Feature: chat-logs-review-system**
"""

import unittest
import sys
import os
from hypothesis import given, strategies as st, settings, HealthCheck

# Add the lambda directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from index import is_reviewed, calculate_metrics


# Custom strategies for generating test data
@st.composite
def item_with_review_fields(draw):
    """
    Generate a DynamoDB item with rev_comment and rev_feedback fields.
    
    This strategy generates items that represent the full range of possible
    review states: empty, whitespace-only, and with actual content.
    """
    # Generate rev_comment: can be empty, whitespace, or actual content
    comment_type = draw(st.sampled_from(['empty', 'whitespace', 'content', 'missing']))
    if comment_type == 'empty':
        rev_comment = ''
    elif comment_type == 'whitespace':
        rev_comment = draw(st.text(alphabet=' \t\n\r', min_size=1, max_size=10))
    elif comment_type == 'content':
        # Generate non-empty content - prepend 'x' to ensure non-whitespace
        base_text = draw(st.text(min_size=0, max_size=50))
        rev_comment = 'x' + base_text
    else:  # missing
        rev_comment = None
    
    # Generate rev_feedback: can be empty, whitespace, or actual content
    feedback_type = draw(st.sampled_from(['empty', 'whitespace', 'content', 'missing']))
    if feedback_type == 'empty':
        rev_feedback = ''
    elif feedback_type == 'whitespace':
        rev_feedback = draw(st.text(alphabet=' \t\n\r', min_size=1, max_size=10))
    elif feedback_type == 'content':
        # Generate non-empty content - prepend 'x' to ensure non-whitespace
        base_text = draw(st.text(min_size=0, max_size=50))
        rev_feedback = 'x' + base_text
    else:  # missing
        rev_feedback = None
    
    # Build the item dictionary
    item = {}
    if rev_comment is not None:
        item['rev_comment'] = rev_comment
    if rev_feedback is not None:
        item['rev_feedback'] = rev_feedback
    
    return item


class TestMetricsCalculationProperties(unittest.TestCase):
    """
    Property-based tests for metrics calculation.
    
    These tests verify the correctness properties defined in the design document.
    """
    
    @given(st.lists(item_with_review_fields(), min_size=0, max_size=100))
    @settings(max_examples=100, suppress_health_check=[HealthCheck.too_slow])
    def test_property_31_reviewed_count_calculation(self, items):
        """
        **Feature: chat-logs-review-system, Property 31: Reviewed count calculation**
        
        Property 31: Reviewed count calculation
        *For any* dataset of chat logs or feedback logs, the count of reviewed entries
        should equal the number of entries where rev_comment is not empty OR rev_feedback
        is not empty.
        
        **Validates: Requirements 8.2, 8.5**
        """
        # Calculate metrics using the function under test
        total, reviewed, pending = calculate_metrics(items)
        
        # Manually count reviewed items using the same logic
        expected_reviewed = 0
        for item in items:
            rev_comment = item.get('rev_comment', '')
            rev_feedback = item.get('rev_feedback', '')
            
            has_comment = bool(rev_comment and str(rev_comment).strip())
            has_feedback = bool(rev_feedback and str(rev_feedback).strip())
            
            if has_comment or has_feedback:
                expected_reviewed += 1
        
        # Verify the property holds
        self.assertEqual(
            reviewed,
            expected_reviewed,
            f"Reviewed count mismatch: expected {expected_reviewed}, got {reviewed}"
        )
    
    @given(st.lists(item_with_review_fields(), min_size=0, max_size=100))
    @settings(max_examples=100, suppress_health_check=[HealthCheck.too_slow])
    def test_property_32_pending_count_calculation(self, items):
        """
        **Feature: chat-logs-review-system, Property 32: Pending count calculation**
        
        Property 32: Pending count calculation
        *For any* dataset of chat logs or feedback logs, the count of pending entries
        should equal the number of entries where both rev_comment AND rev_feedback are empty.
        
        **Validates: Requirements 8.3, 8.6**
        """
        # Calculate metrics using the function under test
        total, reviewed, pending = calculate_metrics(items)
        
        # Manually count pending items
        expected_pending = 0
        for item in items:
            rev_comment = item.get('rev_comment', '')
            rev_feedback = item.get('rev_feedback', '')
            
            has_comment = bool(rev_comment and str(rev_comment).strip())
            has_feedback = bool(rev_feedback and str(rev_feedback).strip())
            
            # Pending means neither has content
            if not has_comment and not has_feedback:
                expected_pending += 1
        
        # Verify the property holds
        self.assertEqual(
            pending,
            expected_pending,
            f"Pending count mismatch: expected {expected_pending}, got {pending}"
        )
    
    @given(st.lists(item_with_review_fields(), min_size=0, max_size=100))
    @settings(max_examples=100, suppress_health_check=[HealthCheck.too_slow])
    def test_total_equals_reviewed_plus_pending(self, items):
        """
        Invariant property: Total count should always equal reviewed + pending.
        
        This is a fundamental invariant that must hold for all datasets.
        """
        total, reviewed, pending = calculate_metrics(items)
        
        # Verify the invariant
        self.assertEqual(
            total,
            reviewed + pending,
            f"Total ({total}) != reviewed ({reviewed}) + pending ({pending})"
        )
    
    @given(st.lists(item_with_review_fields(), min_size=0, max_size=100))
    @settings(max_examples=100, suppress_health_check=[HealthCheck.too_slow])
    def test_total_equals_list_length(self, items):
        """
        Invariant property: Total count should always equal the length of the input list.
        """
        total, reviewed, pending = calculate_metrics(items)
        
        # Verify the invariant
        self.assertEqual(
            total,
            len(items),
            f"Total count ({total}) does not match input list length ({len(items)})"
        )
    
    @given(st.lists(item_with_review_fields(), min_size=0, max_size=100))
    @settings(max_examples=100, suppress_health_check=[HealthCheck.too_slow])
    def test_counts_are_non_negative(self, items):
        """
        Invariant property: All counts (total, reviewed, pending) should be non-negative.
        """
        total, reviewed, pending = calculate_metrics(items)
        
        # Verify all counts are non-negative
        self.assertGreaterEqual(total, 0, "Total count should be non-negative")
        self.assertGreaterEqual(reviewed, 0, "Reviewed count should be non-negative")
        self.assertGreaterEqual(pending, 0, "Pending count should be non-negative")
    
    @given(st.lists(item_with_review_fields(), min_size=0, max_size=100))
    @settings(max_examples=100, suppress_health_check=[HealthCheck.too_slow])
    def test_reviewed_and_pending_bounded_by_total(self, items):
        """
        Invariant property: Reviewed and pending counts should not exceed total count.
        """
        total, reviewed, pending = calculate_metrics(items)
        
        # Verify bounds
        self.assertLessEqual(
            reviewed,
            total,
            f"Reviewed count ({reviewed}) exceeds total ({total})"
        )
        self.assertLessEqual(
            pending,
            total,
            f"Pending count ({pending}) exceeds total ({total})"
        )


if __name__ == '__main__':
    unittest.main()
