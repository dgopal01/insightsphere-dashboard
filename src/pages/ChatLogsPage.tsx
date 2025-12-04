/**
 * Chat Logs Page
 * Displays and manages chat logs
 */

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { LogTable, LogFilters, LogExport, ErrorDisplay } from '../components';
import { useChatLogs } from '../hooks/useChatLogs';
import { classifyError } from '../utils';
import type { LogFilters as LogFiltersType } from '../types/graphql';

const ChatLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<LogFiltersType>({});
  const { logs, isLoading, error, refetch } = useChatLogs({ filters });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chat Logs
      </Typography>
      
      {error && (
        <ErrorDisplay
          error={error}
          type={classifyError(error)}
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}
      
      <Box sx={{ mt: 2 }}>
        <LogFilters filters={filters} onFilterChange={setFilters} />
        <Box sx={{ mt: 2, mb: 2 }}>
          <LogExport logs={logs} disabled={isLoading} />
        </Box>
        <LogTable logs={logs} loading={isLoading} />
      </Box>
    </Box>
  );
};

export default ChatLogsPage;
export { ChatLogsPage };
