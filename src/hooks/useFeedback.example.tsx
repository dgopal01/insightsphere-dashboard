/**
 * Example usage of useFeedback hook
 * This file demonstrates how to use the useFeedback hook in components
 */

import React from 'react';
import { useFeedback } from './useFeedback';

/**
 * Example 1: Fetch all feedback
 */
export function AllFeedbackExample() {
  const { feedback, isLoading, error, metrics } = useFeedback();

  if (isLoading) return <div>Loading feedback...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>All Feedback</h2>
      <div>
        <p>Total: {metrics.totalCount}</p>
        <p>Positive: {metrics.positiveCount}</p>
        <p>Negative: {metrics.negativeCount}</p>
        <p>Average Rating: {metrics.averageRating.toFixed(2)}</p>
      </div>
      <ul>
        {feedback.map((f) => (
          <li key={f.id}>
            Rating: {f.rating} | {f.thumbsUp ? '👍' : '👎'} | {f.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 2: Fetch feedback for a specific log
 */
export function LogFeedbackExample({ logId }: { logId: string }) {
  const { feedback, isLoading, error } = useFeedback({ logId });

  if (isLoading) return <div>Loading feedback for log...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Feedback for Log {logId}</h3>
      {feedback.length === 0 ? (
        <p>No feedback yet</p>
      ) : (
        <ul>
          {feedback.map((f) => (
            <li key={f.id}>
              {f.userId}: {f.rating}/5 - {f.comment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 3: Submit feedback with optimistic updates
 */
export function SubmitFeedbackExample({ logId }: { logId: string }) {
  const { submitFeedback, isSubmitting } = useFeedback({ logId });
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitFeedback({
        logId,
        rating,
        thumbsUp: rating >= 3,
        comment: comment || undefined,
        category: 'helpfulness',
      });

      // Reset form
      setRating(5);
      setComment('');
      alert('Feedback submitted successfully!');
    } catch (error) {
      alert('Failed to submit feedback');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Submit Feedback</h3>
      <div>
        <label>
          Rating (1-5):
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={isSubmitting}
          />
        </label>
      </div>
      <div>
        <label>
          Comment:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            disabled={isSubmitting}
          />
        </label>
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
}

/**
 * Example 4: Fetch feedback by user with date range
 */
export function UserFeedbackExample({ userId }: { userId: string }) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  const { feedback, isLoading, hasNextPage, fetchNextPage, metrics } = useFeedback({
    userId,
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
  });

  if (isLoading) return <div>Loading user feedback...</div>;

  return (
    <div>
      <h3>Feedback by {userId} (Last 30 days)</h3>
      <div>
        <p>Total feedback: {metrics.totalCount}</p>
        <p>Average rating: {metrics.averageRating.toFixed(2)}</p>
      </div>
      <ul>
        {feedback.map((f) => (
          <li key={f.id}>
            {new Date(f.timestamp).toLocaleDateString()} - Rating: {f.rating}
          </li>
        ))}
      </ul>
      {hasNextPage && <button onClick={fetchNextPage}>Load More</button>}
    </div>
  );
}

/**
 * Example 5: Real-time feedback updates
 * The hook automatically subscribes to new feedback and updates the list
 */
export function RealtimeFeedbackExample({ logId }: { logId: string }) {
  const { feedback, metrics } = useFeedback({ logId });

  return (
    <div>
      <h3>Real-time Feedback (Auto-updates)</h3>
      <p>This list automatically updates when new feedback is submitted</p>
      <div>
        <p>Total: {metrics.totalCount}</p>
        <p>Positive: {metrics.positiveCount}</p>
        <p>Negative: {metrics.negativeCount}</p>
      </div>
      <ul>
        {feedback.map((f) => (
          <li key={f.id}>
            {new Date(f.timestamp).toLocaleTimeString()} - {f.rating}/5
          </li>
        ))}
      </ul>
    </div>
  );
}
