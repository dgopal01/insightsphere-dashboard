/**
 * AI Metrics Dashboard Page
 * Displays AI Quality & Responsible Metrics from UnityAIAssistantEvalJob table
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { listAIEvaluationJobs, type AIEvaluationJobEntry } from '../services/DynamoDBService';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { classifyError } from '../utils';

/**
 * Calculate metrics from evaluation jobs
 */
function calculateMetrics(jobs: AIEvaluationJobEntry[]) {
  if (jobs.length === 0) {
    return {
      totalConversations: 0,
      pendingReviews: 0,
      correctness: 0,
      helpfulness: 0,
      faithfulness: 0,
      harmfulness: 0,
      stereotyping: 0,
      logicalCoherence: 0,
      completeness: 0,
    };
  }

  let correctnessSum = 0;
  let helpfulnessSum = 0;
  let faithfulnessSum = 0;
  let harmfulnessSum = 0;
  let stereotypingSum = 0;
  let logicalCoherenceSum = 0;
  let completenessSum = 0;

  jobs.forEach((job) => {
    job.results?.forEach((result) => {
      const score = result.result || 0;
      switch (result.metricName) {
        case 'Builtin.Correctness':
          correctnessSum += score;
          break;
        case 'Builtin.Helpfulness':
          helpfulnessSum += score;
          break;
        case 'Builtin.Faithfulness':
          faithfulnessSum += score;
          break;
        case 'Builtin.Harmfulness':
          harmfulnessSum += score;
          break;
        case 'Builtin.Stereotyping':
          stereotypingSum += score;
          break;
        case 'Builtin.LogicalCoherence':
          logicalCoherenceSum += score;
          break;
        case 'Builtin.Completeness':
          completenessSum += score;
          break;
      }
    });
  });

  const count = jobs.length;

  return {
    totalConversations: count,
    pendingReviews: 0, // TODO: Calculate based on review status
    correctness: correctnessSum / count,
    helpfulness: helpfulnessSum / count,
    faithfulness: faithfulnessSum / count,
    harmfulness: harmfulnessSum / count,
    stereotyping: stereotypingSum / count,
    logicalCoherence: logicalCoherenceSum / count,
    completeness: completenessSum / count,
  };
}

/**
 * AI Metrics Dashboard Page Component
 */
const AIMetricsDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<AIEvaluationJobEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await listAIEvaluationJobs(1000);
        setJobs(result.items);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI metrics';
        setError(new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = calculateMetrics(jobs);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          AI Quality & Responsible Metrics
        </Typography>
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={() => window.location.reload()}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Quality & Responsible Metrics
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        AI chatbot performance metrics and insights
      </Typography>

      {/* Metrics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Total Conversations */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Conversations
              </Typography>
              <Typography variant="h4">{metrics.totalConversations.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Correctness */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Correctness (Avg.)
              </Typography>
              <Typography variant="h4">{metrics.correctness.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Helpfulness */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Helpfulness (Avg.)
              </Typography>
              <Typography variant="h4">{metrics.helpfulness.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Faithfulness */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Faithfulness (Avg.)
              </Typography>
              <Typography variant="h4">{metrics.faithfulness.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Harmfulness */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Harmfulness (Avg.)
              </Typography>
              <Typography variant="h4">{metrics.harmfulness.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Stereotyping */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Stereotyping (Avg.)
              </Typography>
              <Typography variant="h4">{metrics.stereotyping.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Logical Coherence */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Logical Coherence (Avg.)
              </Typography>
              <Typography variant="h4">{metrics.logicalCoherence.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Completeness */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Completeness (Avg.)
              </Typography>
              <Typography variant="h4">{metrics.completeness.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Placeholder for charts - will be added in next iteration */}
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
        Score distribution charts coming soon...
      </Typography>
    </Box>
  );
};

export default AIMetricsDashboardPage;
export { AIMetricsDashboardPage };
