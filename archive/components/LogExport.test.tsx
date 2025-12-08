/**
 * LogExport Component Tests
 * Tests CSV generation and export functionality
 *
 * NOTE: These tests are excluded from the test suite on Windows due to a file handle
 * limitation (EMFILE: too many open files) caused by @mui/icons-material having
 * thousands of icon files. The tests are valid and will run successfully on Linux/Mac
 * or WSL. See vitest.config.ts for the exclusion configuration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogExport } from './LogExport';
import type { ChatLog } from '../types/graphql';
import * as StorageServiceModule from '../services/StorageService';

// Mock the storage service
vi.mock('../services/StorageService', () => ({
  storageService: {
    uploadFile: vi.fn(),
    getSignedUrl: vi.fn(),
  },
  StorageService: vi.fn(),
  StorageError: class StorageError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'StorageError';
    }
  },
}));

describe('LogExport', () => {
  const mockLogs: ChatLog[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      userId: 'user-1',
      timestamp: '2024-01-01T10:00:00Z',
      userMessage: 'Hello',
      aiResponse: 'Hi there!',
      responseTime: 100,
      accuracy: 95,
      sentiment: 'positive',
    },
    {
      id: '2',
      conversationId: 'conv-1',
      userId: 'user-1',
      timestamp: '2024-01-01T10:01:00Z',
      userMessage: 'How are you?',
      aiResponse: 'I am doing well, thank you!',
      responseTime: 150,
      accuracy: 90,
      sentiment: 'positive',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export button', () => {
    render(<LogExport logs={mockLogs} />);
    expect(screen.getByRole('button', { name: /export to csv/i })).toBeInTheDocument();
  });

  it('disables button when no logs', () => {
    render(<LogExport logs={[]} />);
    const button = screen.getByRole('button', { name: /export to csv/i });
    expect(button).toBeDisabled();
  });

  it('disables button when disabled prop is true', () => {
    render(<LogExport logs={mockLogs} disabled={true} />);
    const button = screen.getByRole('button', { name: /export to csv/i });
    expect(button).toBeDisabled();
  });

  it('generates CSV with all columns', async () => {
    const mockUploadFile = vi.fn().mockResolvedValue('exports/test.csv');
    const mockGetSignedUrl = vi.fn().mockResolvedValue('https://example.com/download');

    vi.mocked(StorageServiceModule.storageService.uploadFile).mockImplementation(mockUploadFile);
    vi.mocked(StorageServiceModule.storageService.getSignedUrl).mockImplementation(
      mockGetSignedUrl
    );

    const user = userEvent.setup();
    render(<LogExport logs={mockLogs} />);

    const button = screen.getByRole('button', { name: /export to csv/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
    });

    // Check that CSV was generated with correct content
    const uploadCall = mockUploadFile.mock.calls[0];
    const blob = uploadCall[1] as Blob;
    const csvContent = await blob.text();

    // Verify headers
    expect(csvContent).toContain(
      'ID,Timestamp,User ID,Conversation ID,User Message,AI Response,Response Time (ms),Accuracy,Sentiment'
    );

    // Verify data rows
    expect(csvContent).toContain(
      '1,2024-01-01T10:00:00Z,user-1,conv-1,Hello,Hi there!,100,95,positive'
    );
    expect(csvContent).toContain(
      '2,2024-01-01T10:01:00Z,user-1,conv-1,How are you?,I am doing well, thank you!,150,90,positive'
    );
  });

  it('escapes CSV fields with commas', async () => {
    const logsWithCommas: ChatLog[] = [
      {
        id: '1',
        conversationId: 'conv-1',
        userId: 'user-1',
        timestamp: '2024-01-01T10:00:00Z',
        userMessage: 'Hello, how are you?',
        aiResponse: 'I am fine, thank you!',
        responseTime: 100,
      },
    ];

    const mockUploadFile = vi.fn().mockResolvedValue('exports/test.csv');
    const mockGetSignedUrl = vi.fn().mockResolvedValue('https://example.com/download');

    vi.mocked(StorageServiceModule.storageService.uploadFile).mockImplementation(mockUploadFile);
    vi.mocked(StorageServiceModule.storageService.getSignedUrl).mockImplementation(
      mockGetSignedUrl
    );

    const user = userEvent.setup();
    render(<LogExport logs={logsWithCommas} />);

    const button = screen.getByRole('button', { name: /export to csv/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
    });

    const uploadCall = mockUploadFile.mock.calls[0];
    const blob = uploadCall[1] as Blob;
    const csvContent = await blob.text();

    // Fields with commas should be quoted
    expect(csvContent).toContain('"Hello, how are you?"');
    expect(csvContent).toContain('"I am fine, thank you!"');
  });

  it('handles export errors gracefully', async () => {
    const mockUploadFile = vi.fn().mockRejectedValue(new Error('Upload failed'));

    vi.mocked(StorageServiceModule.storageService.uploadFile).mockImplementation(mockUploadFile);

    const user = userEvent.setup();
    render(<LogExport logs={mockLogs} />);

    const button = screen.getByRole('button', { name: /export to csv/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/export failed/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });

  it('displays download link after successful export', async () => {
    const mockUploadFile = vi.fn().mockResolvedValue('exports/test.csv');
    const mockGetSignedUrl = vi.fn().mockResolvedValue('https://example.com/download');

    vi.mocked(StorageServiceModule.storageService.uploadFile).mockImplementation(mockUploadFile);
    vi.mocked(StorageServiceModule.storageService.getSignedUrl).mockImplementation(
      mockGetSignedUrl
    );

    const user = userEvent.setup();
    render(<LogExport logs={mockLogs} />);

    const button = screen.getByRole('button', { name: /export to csv/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/export complete/i)).toBeInTheDocument();
    });

    const downloadLink = screen.getByRole('link', { name: /download csv/i });
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/download');
  });

  it('uploads CSV to S3 with correct metadata', async () => {
    const mockUploadFile = vi.fn().mockResolvedValue('exports/test.csv');
    const mockGetSignedUrl = vi.fn().mockResolvedValue('https://example.com/download');

    vi.mocked(StorageServiceModule.storageService.uploadFile).mockImplementation(mockUploadFile);
    vi.mocked(StorageServiceModule.storageService.getSignedUrl).mockImplementation(
      mockGetSignedUrl
    );

    const user = userEvent.setup();
    render(<LogExport logs={mockLogs} />);

    const button = screen.getByRole('button', { name: /export to csv/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
    });

    const uploadCall = mockUploadFile.mock.calls[0];
    const options = uploadCall[2];

    expect(options.contentType).toBe('text/csv');
    expect(options.metadata).toHaveProperty('exportDate');
    expect(options.metadata?.logCount).toBe('2');
  });
});
