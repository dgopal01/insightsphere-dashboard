/**
 * LogExport Component
 * Handles CSV export of chat logs with S3 upload
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import React, { useState } from 'react';
import { Button, CircularProgress, Box, Alert, Link, Typography, Snackbar } from '@mui/material';
import { Download, CheckCircle } from '@mui/icons-material';
import type { ChatLog } from '../types/graphql';
import { storageService } from '../services/StorageService';

/**
 * Props for LogExport component
 */
export interface LogExportProps {
  logs: ChatLog[];
  filename?: string;
  disabled?: boolean;
}

/**
 * Export state
 */
interface ExportState {
  isExporting: boolean;
  downloadUrl: string | null;
  error: string | null;
  progress: number;
}

/**
 * LogExport Component
 */
export const LogExport: React.FC<LogExportProps> = ({
  logs,
  filename = 'chat-logs-export',
  disabled = false,
}) => {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    downloadUrl: null,
    error: null,
    progress: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Convert chat logs to CSV format
   * Includes all log columns with proper formatting
   */
  const generateCSV = (logs: ChatLog[]): string => {
    // Define CSV headers - all log columns
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'Conversation ID',
      'User Message',
      'AI Response',
      'Response Time (ms)',
      'Accuracy',
      'Sentiment',
    ];

    // Escape CSV field (handle quotes and commas)
    const escapeCSVField = (field: string | number | undefined): string => {
      if (field === undefined || field === null) {
        return '';
      }
      const stringValue = String(field);
      // If field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Build CSV rows
    const rows = logs.map((log) => {
      return [
        escapeCSVField(log.id),
        escapeCSVField(log.timestamp),
        escapeCSVField(log.userId),
        escapeCSVField(log.conversationId),
        escapeCSVField(log.userMessage),
        escapeCSVField(log.aiResponse),
        escapeCSVField(log.responseTime),
        escapeCSVField(log.accuracy),
        escapeCSVField(log.sentiment),
      ].join(',');
    });

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n');
  };

  /**
   * Handle export button click
   */
  const handleExport = async () => {
    // Reset state
    setState({
      isExporting: true,
      downloadUrl: null,
      error: null,
      progress: 0,
    });

    try {
      // Generate CSV content
      const csvContent = generateCSV(logs);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Update progress
      setState((prev) => ({ ...prev, progress: 33 }));

      // Generate unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const key = `exports/${filename}-${timestamp}.csv`;

      // Upload to S3 with progress tracking
      await storageService.uploadFile(key, blob, {
        contentType: 'text/csv',
        metadata: {
          exportDate: new Date().toISOString(),
          logCount: String(logs.length),
        },
        onProgress: (progress) => {
          if (progress.totalBytes) {
            const percentage = Math.round((progress.transferredBytes / progress.totalBytes) * 100);
            setState((prev) => ({ ...prev, progress: 33 + percentage * 0.33 }));
          }
        },
      });

      // Update progress
      setState((prev) => ({ ...prev, progress: 66 }));

      // Get signed URL for download
      const signedUrl = await storageService.getSignedUrl(key, {
        expiresIn: 3600, // 1 hour
      });

      // Update progress
      setState((prev) => ({ ...prev, progress: 100 }));

      // Update state with download URL
      setState({
        isExporting: false,
        downloadUrl: signedUrl,
        error: null,
        progress: 100,
      });

      // Show success message
      setShowSuccess(true);
    } catch (error) {
      console.error('Export error:', error);
      setState({
        isExporting: false,
        downloadUrl: null,
        error: error instanceof Error ? error.message : 'Failed to export logs',
        progress: 0,
      });
    }
  };

  /**
   * Handle success snackbar close
   */
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Box>
      {/* Export Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={
          state.isExporting ? <CircularProgress size={20} color="inherit" /> : <Download />
        }
        onClick={handleExport}
        disabled={disabled || state.isExporting || logs.length === 0}
        sx={{
          mb: 2,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          },
        }}
        aria-label={
          state.isExporting
            ? `Exporting chat logs, ${state.progress} percent complete`
            : `Export ${logs.length} chat logs to CSV`
        }
        aria-busy={state.isExporting}
        aria-live="polite"
      >
        {state.isExporting ? `Exporting... ${state.progress}%` : 'Export to CSV'}
      </Button>

      {/* Error Message */}
      {state.error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setState((prev) => ({ ...prev, error: null }))}
          role="alert"
          aria-live="assertive"
        >
          <Typography variant="body2">
            <strong>Export Failed:</strong> {state.error}
          </Typography>
        </Alert>
      )}

      {/* Download Link */}
      {state.downloadUrl && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mb: 2 }}
          role="status"
          aria-live="polite"
        >
          <Typography variant="body2" gutterBottom>
            <strong>Export Complete!</strong> Your CSV file is ready for download.
          </Typography>
          <Link
            href={state.downloadUrl}
            download={`${filename}.csv`}
            underline="hover"
            sx={{
              fontWeight: 'bold',
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
            aria-label={`Download CSV file containing ${logs.length} chat logs`}
          >
            Download CSV ({logs.length} logs)
          </Link>
          <Typography variant="caption" display="block" sx={{ mt: 1 }} role="note">
            Link expires in 1 hour
          </Typography>
        </Alert>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }} role="status">
          CSV export completed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};
