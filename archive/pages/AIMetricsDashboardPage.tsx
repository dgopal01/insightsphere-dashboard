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
  Button,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { listAIEvaluationJobs, type AIEvaluationJobEntry } from '../services/DynamoDBService';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { classifyError } from '../utils';

/**
 * Calculate score distribution for a specific metric
 */
function calculateScoreDistribution(jobs: AIEvaluationJobEntry[], metricName: string) {
  const bins = [
    { range: '0.0-0.1', min: 0, max: 0.1, count: 0 },
    { range: '0.1-0.2', min: 0.1, max: 0.2, count: 0 },
    { range: '0.2-0.3', min: 0.2, max: 0.3, count: 0 },
    { range: '0.3-0.4', min: 0.3, max: 0.4, count: 0 },
    { range: '0.4-0.5', min: 0.4, max: 0.5, count: 0 },
    { range: '0.5-0.6', min: 0.5, max: 0.6, count: 0 },
    { range: '0.6-0.7', min: 0.6, max: 0.7, count: 0 },
    { range: '0.7-0.8', min: 0.7, max: 0.8, count: 0 },
    { range: '0.8-0.9', min: 0.8, max: 0.9, count: 0 },
    { range: '0.9-1.0', min: 0.9, max: 1.0, count: 0 },
  ];

  jobs.forEach((job) => {
    job.results?.forEach((result) => {
      if (result.metricName === metricName && result.result !== undefined) {
        const score = result.result;
        const bin = bins.find((b) => score >= b.min && score <= b.max);
        if (bin) bin.count++;
      }
    });
  });

  return bins;
}

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

      {/* Score Distribution Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Helpfulness Distribution */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Helpfulness Score Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Distribution of conversations by helpfulness score (0.0 - 1.0 scale)
                </Typography>
              </Box>
              <Button size="small" variant="outlined">
                See Conversations
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Helpfulness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#17a2b8" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Correctness Distribution */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Correctness Score Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Distribution of conversations by correctness score (0.0 - 1.0 scale)
                </Typography>
              </Box>
              <Button size="small" variant="outlined">
                See Conversations
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Correctness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2c3e50" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Faithfulness Distribution */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Faithfulness Scores
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  How closely AI's answers match the true source (facts without inventing information) (0.0 - 1.0 scale)
                </Typography>
              </Box>
              <Button size="small" variant="outlined">
                See Conversations
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Faithfulness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#28a745" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Harmfulness Distribution */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Harmfulness Scores
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  The potential for AI systems to cause physical, psychological, economic, or social harm (0.0 - 1.0 scale)
                </Typography>
              </Box>
              <Button size="small" variant="outlined">
                See Conversations
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Harmfulness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#fd7e14" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stereotyping Distribution */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Stereotyping Score
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  When AI systems reinforce biased, harmful stereotypes about groups of people (0.0 - 1.0 scale)
                </Typography>
              </Box>
              <Button size="small" variant="outlined">
                See Conversations
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Stereotyping')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#9b59b6" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AIMetricsDashboardPage;
export { AIMetricsDashboardPage };
