/**
 * AI Metrics Dashboard Page (New Design System)
 * Displays AI Quality & Responsible Metrics from UnityAIAssistantEvalJob table
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, X, MessageSquare } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    pendingReviews: 0,
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
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </CardContent>
  </Card>
);

/**
 * AI Metrics Dashboard Page Component
 */
const AIMetricsDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<AIEvaluationJobEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<AIEvaluationJobEntry[]>([]);

  const handleSeeConversations = (metricName: string) => {
    setSelectedMetric(metricName);
    setSelectedJobs(jobs);
  };

  const handleCloseModal = () => {
    setSelectedMetric(null);
    setSelectedJobs([]);
  };

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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading AI metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Quality & Responsible Metrics</h1>
            <p className="text-muted-foreground">AI chatbot performance metrics and insights</p>
          </div>
        </div>
        <Separator />
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={() => window.location.reload()}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="size-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI Quality & Responsible Metrics</h1>
          <p className="text-muted-foreground">AI chatbot performance metrics and insights</p>
        </div>
      </div>

      <Separator />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Conversations"
          value={metrics.totalConversations.toLocaleString()}
          icon={<TrendingUp className="size-8" />}
        />
        <MetricCard
          label="Correctness (Avg.)"
          value={metrics.correctness.toFixed(2)}
          icon={<BarChart3 className="size-8" />}
        />
        <MetricCard
          label="Helpfulness (Avg.)"
          value={metrics.helpfulness.toFixed(2)}
          icon={<BarChart3 className="size-8" />}
        />
        <MetricCard
          label="Faithfulness (Avg.)"
          value={metrics.faithfulness.toFixed(2)}
          icon={<BarChart3 className="size-8" />}
        />
        <MetricCard
          label="Harmfulness (Avg.)"
          value={metrics.harmfulness.toFixed(2)}
          icon={<AlertCircle className="size-8" />}
        />
        <MetricCard
          label="Stereotyping (Avg.)"
          value={metrics.stereotyping.toFixed(2)}
          icon={<AlertCircle className="size-8" />}
        />
        <MetricCard
          label="Logical Coherence (Avg.)"
          value={metrics.logicalCoherence.toFixed(2)}
          icon={<BarChart3 className="size-8" />}
        />
        <MetricCard
          label="Completeness (Avg.)"
          value={metrics.completeness.toFixed(2)}
          icon={<BarChart3 className="size-8" />}
        />
      </div>

      {/* Score Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Helpfulness Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Helpfulness Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of conversations by helpfulness score (0.0 - 1.0 scale)
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleSeeConversations('Builtin.Helpfulness')}>
                See Conversations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Helpfulness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Correctness Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Correctness Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of conversations by correctness score (0.0 - 1.0 scale)
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleSeeConversations('Builtin.Correctness')}>
                See Conversations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Correctness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Faithfulness Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Faithfulness Scores</CardTitle>
                <CardDescription>
                  How closely AI's answers match the true source (facts without inventing information)
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleSeeConversations('Builtin.Faithfulness')}>
                See Conversations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Faithfulness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Harmfulness Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Harmfulness Scores</CardTitle>
                <CardDescription>
                  The potential for AI systems to cause physical, psychological, economic, or social harm
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleSeeConversations('Builtin.Harmfulness')}>
                See Conversations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Harmfulness')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-4))" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stereotyping Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Stereotyping Score</CardTitle>
                <CardDescription>
                  When AI systems reinforce biased, harmful stereotypes about groups of people
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleSeeConversations('Builtin.Stereotyping')}>
                See Conversations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateScoreDistribution(jobs, 'Builtin.Stereotyping')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Total Conversations', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-5))" name="Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversations Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-[95vw] max-h-[90vh] overflow-auto bg-white shadow-2xl" style={{ backgroundColor: '#ffffff' }}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    Conversations for {selectedMetric}
                  </CardTitle>
                  <CardDescription>
                    Showing {selectedJobs.length} conversations with scores and details
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="size-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground font-medium">
                        Conversation Input
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground font-medium">
                        AI Output
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground font-medium">
                        Retrieved Sources
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground font-medium">
                        Ground Truth
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-muted-foreground font-medium">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedJobs.map((job, index) => {
                      const sourcesCount = job.citations_metadata?.length || 0;
                      const scores = job.results?.filter(r => r.metricName === selectedMetric) || [];
                      const score = scores[0]?.result;
                      
                      return (
                        <tr key={`${job.log_id}-${index}`} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 text-sm max-w-md align-top">
                            {job.prompt_text}
                          </td>
                          <td className="px-6 py-4 text-sm max-w-md align-top">
                            {job.output_text}
                          </td>
                          <td className="px-6 py-4 text-sm align-top">
                            {sourcesCount}
                          </td>
                          <td className="px-6 py-4 text-sm max-w-xs align-top">
                            {job.reference_response_text || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm align-top">
                            <span className="font-medium">
                              {score ? score.toFixed(2) : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIMetricsDashboardPage;
