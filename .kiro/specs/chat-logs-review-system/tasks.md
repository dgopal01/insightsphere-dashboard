# Implementation Plan

- [x] 1. Project setup and cleanup









  - Remove existing project files and dependencies
  - Initialize fresh React + TypeScript project with Vite
  - Install core dependencies (React 18, TypeScript, Material-UI, AWS Amplify)
  - Configure TypeScript, ESLint, and Prettier
  - Set up project folder structure (components, hooks, services, types, utils)
  - _Requirements: All_

- [x] 2. AWS infrastructure setup with CloudFormation





  - Create CloudFormation template for complete infrastructure
  - Define DynamoDB tables (UnityAIAssistantLogs, UserFeedback) with GSIs
  - Configure Cognito User Pool and App Client
  - Set up AppSync GraphQL API with schema
  - Create Lambda function for metrics calculation
  - Configure IAM roles and policies
  - Add Amplify Hosting configuration
  - _Requirements: 1.1, 1.2, 2.1, 5.1, 8.1_

- [x] 3. Deployment script





  - Create Windows Command Prompt batch script (deploy.cmd)
  - Implement AWS credential validation
  - Add Lambda function packaging logic
  - Implement CloudFormation stack deployment
  - Add output display for application URL and configuration
  - Include error handling and rollback logic
  - _Requirements: All_

- [x] 4. GraphQL schema and resolvers





  - Define GraphQL types for UnityAIAssistantLog and UserFeedback
  - Create queries (listUnityAIAssistantLogs, listUserFeedbacks, getReviewMetrics)
  - Create mutations (updateUnityAIAssistantLog, updateUserFeedback)
  - Implement DynamoDB resolvers for queries and mutations
  - Configure GSI-based filtering for carrier/carrier_name
  - _Requirements: 2.1, 2.2, 3.1, 4.4, 5.1, 5.2, 6.1, 7.4_

- [x] 5. Lambda function for metrics calculation





  - Implement GetReviewMetrics Lambda function
  - Query both DynamoDB tables for counts
  - Calculate reviewed counts (entries with rev_comment OR rev_feedback)
  - Calculate pending counts (entries with empty rev_comment AND rev_feedback)
  - Return aggregated metrics
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 5.1 Write property test for metrics calculation






  - **Property 31: Reviewed count calculation**
  - **Property 32: Pending count calculation**
  - **Validates: Requirements 8.2, 8.3, 8.5, 8.6**

- [x] 6. Authentication setup





  - Configure Amplify with Cognito settings
  - Create AuthContext for managing authentication state
  - Implement SignInPage component with Cognito Hosted UI
  - Add authentication token management
  - Implement logout functionality
  - Create ProtectedRoute component for route guarding
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 6.1 Write property test for authentication
  - **Property 1: Valid credentials grant access**
  - **Property 2: Invalid credentials deny access**
  - **Property 3: Logout clears authentication**
  - **Validates: Requirements 1.2, 1.3, 1.5**

- [x] 7. Core data types and interfaces





  - Define ChatLogEntry interface
  - Define FeedbackLogEntry interface
  - Define ReviewMetrics interface
  - Define filter types (LogFilters, FeedbackFilters)
  - Define PaginationState interface
  - Define ReviewData interface
  - _Requirements: 2.2, 5.2, 8.1_

- [x] 8. Input validation and sanitization utilities





  - Create validation functions for character limits
  - Implement XSS sanitization function
  - Create special character escaping function
  - Implement required field validation
  - Add input validation error messages
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 8.1 Write property tests for validation and sanitization
  - **Property 13: Comment field validation**
  - **Property 14: Feedback field validation**
  - **Property 34: XSS prevention in comments**
  - **Property 35: XSS prevention in feedback**
  - **Property 36: Character limit enforcement**
  - **Property 37: Required field validation**
  - **Property 38: Special character escaping**
  - **Validates: Requirements 4.2, 4.3, 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 9. Error handling utilities





  - Create error classification function (network, auth, GraphQL, validation, application)
  - Implement user-friendly error message mapping
  - Create error logging utility
  - Implement retry logic with exponential backoff
  - Create ErrorBoundary component
  - Create ErrorDisplay component
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 9.1 Write property tests for error handling
  - **Property 39: GraphQL error messaging**
  - **Property 40: Network error messaging**
  - **Property 41: Authentication error redirect**
  - **Property 42: Mutation failure data preservation**
  - **Property 43: Unexpected error handling**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [x] 10. Common UI components





  - Create Layout component with navigation sidebar
  - Create LoadingSpinner component
  - Implement Header component with user info and logout
  - Create Sidebar component with navigation links
  - Set up routing with React Router
  - _Requirements: All_

- [x] 11. useChatLogs custom hook





  - Implement data fetching with GraphQL query
  - Add filtering logic (carrier_name, date range, review status)
  - Add sorting logic (timestamp ascending/descending)
  - Implement pagination with nextToken
  - Create updateReview mutation function
  - Add error handling and loading states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.4_

- [ ]* 11.1 Write property tests for chat logs hook
  - **Property 7: Carrier filter matches results**
  - **Property 8: Timestamp sort ordering**
  - **Property 9: Multiple filters intersection**
  - **Property 10: Clear filters shows all data**
  - **Property 11: Pagination state invariant**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [x] 12. Chat Logs Review screen components





  - Create ChatLogsReviewPage container component
  - Implement ChatLogsDataTable with Material-UI DataGrid
  - Add column definitions for all chat log fields
  - Implement filter controls (carrier dropdown, date pickers, status filter)
  - Add sort controls for timestamp
  - Implement pagination controls
  - Integrate useChatLogs hook
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 12.1 Write property tests for chat logs display
  - **Property 4: All chat log fields displayed**
  - **Property 5: Query errors show error UI**
  - **Property 6: Loading state shows indicator**
  - **Validates: Requirements 2.2, 2.4, 2.5**

- [x] 13. Chat Log Review Modal





  - Create ChatLogReviewModal component
  - Display all log fields in detailed view
  - Implement review comment textarea with character counter
  - Implement review feedback textarea with character counter
  - Add input validation (character limits, required fields)
  - Implement submit button with loading state
  - Add success/error message display
  - Integrate with updateReview mutation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 13.1 Write property tests for review submission
  - **Property 12: Detail view shows all fields**
  - **Property 15: Review submission updates database**
  - **Property 16: Successful update shows confirmation**
  - **Property 17: Failed update preserves data**
  - **Validates: Requirements 4.1, 4.4, 4.5, 4.6**

- [x] 14. useFeedbackLogs custom hook




  - Implement data fetching with GraphQL query
  - Add filtering logic (carrier, date range, review status)
  - Add sorting logic (datetime ascending/descending)
  - Implement pagination with nextToken
  - Create updateReview mutation function
  - Add error handling and loading states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.4_

- [ ]* 14.1 Write property tests for feedback logs hook
  - **Property 20: Carrier filter matches feedback results**
  - **Property 21: Datetime sort ordering**
  - **Property 22: Multiple feedback filters intersection**
  - **Property 23: Clear feedback filters shows all data**
  - **Property 24: Feedback pagination state invariant**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [x] 15. Feedback Logs Review screen components





  - Create FeedbackLogsReviewPage container component
  - Implement FeedbackLogsDataTable with Material-UI DataGrid
  - Add column definitions for all feedback log fields
  - Implement filter controls (carrier dropdown, date pickers, status filter)
  - Add sort controls for datetime
  - Implement pagination controls
  - Integrate useFeedbackLogs hook
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 15.1 Write property tests for feedback logs display
  - **Property 18: All feedback log fields displayed**
  - **Property 19: Feedback query errors show error UI**
  - **Validates: Requirements 5.2, 5.4**

- [x] 16. Feedback Log Review Modal




  - Create FeedbackLogReviewModal component
  - Display all feedback fields in detailed view
  - Implement review comment textarea with character counter
  - Implement review feedback textarea with character counter
  - Add input validation (character limits, required fields)
  - Implement submit button with loading state
  - Add success/error message display
  - Integrate with updateReview mutation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]* 16.1 Write property tests for feedback review submission
  - **Property 25: Feedback detail view shows all fields**
  - **Property 26: Feedback comment field validation**
  - **Property 27: Feedback feedback field validation**
  - **Property 28: Feedback review submission updates database**
  - **Property 29: Successful feedback update shows confirmation**
  - **Property 30: Failed feedback update preserves data**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

- [x] 17. useReviewMetrics custom hook




  - Implement GraphQL query for getReviewMetrics
  - Add auto-refresh logic with configurable interval
  - Calculate percentage values from counts
  - Add error handling and loading states
  - Track last updated timestamp
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_


- [x] 18. Review Dashboard components




  - Create ReviewDashboardPage container component
  - Implement MetricsCard component with color-coded display
  - Add color logic (green >80%, yellow 40-80%, red <40%)
  - Display metrics for chat logs (total, reviewed, pending, percentage)
  - Display metrics for feedback logs (total, reviewed, pending, percentage)
  - Add auto-refresh indicator and last updated timestamp
  - Integrate useReviewMetrics hook
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 18.1 Write property tests for dashboard metrics
  - **Property 33: Metrics display completeness**
  - **Validates: Requirements 9.4**

- [x] 19. Testing infrastructure setup





  - Configure Vitest for unit and property-based testing
  - Install and configure fast-check for property-based testing
  - Install React Testing Library
  - Create test utilities and helpers
  - Set up test data generators for property tests
  - Configure test coverage reporting
  - Create mock GraphQL responses
  - _Requirements: All_

- [x] 20. Integration testing




  - Set up MSW (Mock Service Worker) for API mocking
  - Create integration tests for authentication flow
  - Test complete chat log review workflow
  - Test complete feedback log review workflow
  - Test dashboard metrics loading and display
  - Test error handling across component boundaries
  - _Requirements: All_

- [x] 21. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Build optimization and deployment preparation





  - Configure Vite build settings for production
  - Implement code splitting for routes
  - Add lazy loading for heavy components
  - Optimize bundle size (tree shaking, minification)
  - Configure environment variables for different stages
  - Test production build locally
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 23. Documentation





  - Create README with setup instructions
  - Document deployment process
  - Add API documentation for GraphQL schema
  - Create user guide for reviewers
  - Document environment variables and configuration
  - Add troubleshooting guide
  - _Requirements: All_

- [x] 24. Final checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
