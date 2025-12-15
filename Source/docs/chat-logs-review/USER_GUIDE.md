# User Guide - Chat Logs Review System

Welcome to the Chat Logs Review System! This guide will help you get started with reviewing chat logs and feedback from the Unity AI Assistant.

## Table of Contents

- [Getting Started](#getting-started)
- [Signing In](#signing-in)
- [Dashboard Overview](#dashboard-overview)
- [Reviewing Chat Logs](#reviewing-chat-logs)
- [Reviewing Feedback Logs](#reviewing-feedback-logs)
- [Filtering and Sorting](#filtering-and-sorting)
- [Submitting Reviews](#submitting-reviews)
- [Best Practices](#best-practices)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Getting Started

### What is the Chat Logs Review System?

The Chat Logs Review System is a web application that allows you to:

- **Review AI Conversations**: Examine interactions between users and the Unity AI Assistant
- **Evaluate Feedback**: Review user-submitted feedback on AI responses
- **Track Progress**: Monitor review completion through a dashboard
- **Add Comments**: Document your findings and assessments

### Who Should Use This System?

- Quality Assurance Reviewers
- AI Training Specialists
- Customer Support Managers
- Product Managers
- Anyone responsible for evaluating AI assistant performance

### System Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet Connection**: Stable broadband connection
- **Screen Resolution**: Minimum 1280x720 (1920x1080 recommended)
- **Account**: Valid credentials provided by your administrator

## Signing In

### First-Time Sign In

1. Navigate to the application URL provided by your administrator
2. Click "Sign In" button
3. Enter your email address
4. Enter your temporary password (provided by admin)
5. You'll be prompted to create a new password
6. Create a strong password (minimum 8 characters, including uppercase, lowercase, numbers, and symbols)
7. Click "Change Password"
8. You'll be automatically signed in

### Subsequent Sign Ins

1. Navigate to the application URL
2. Click "Sign In" button
3. Enter your email address
4. Enter your password
5. Click "Sign In"

### Forgot Password?

1. Click "Forgot Password?" on the sign-in page
2. Enter your email address
3. Check your email for a verification code
4. Enter the verification code
5. Create a new password
6. Sign in with your new password

## Dashboard Overview

After signing in, you'll see the Review Dashboard - your central hub for monitoring review progress.

### Dashboard Components

#### Metrics Cards

The dashboard displays four key metrics:

1. **Chat Logs Total**
   - Total number of chat log entries
   - Number reviewed (with comments/feedback)
   - Number pending (no review yet)
   - Completion percentage

2. **Chat Logs Status**
   - Color-coded indicator:
     - 🟢 Green: >80% reviewed (excellent progress)
     - 🟡 Yellow: 40-80% reviewed (moderate progress)
     - 🔴 Red: <40% reviewed (needs attention)

3. **Feedback Logs Total**
   - Total number of feedback entries
   - Number reviewed
   - Number pending
   - Completion percentage

4. **Feedback Logs Status**
   - Color-coded indicator (same as chat logs)

#### Auto-Refresh

- Dashboard automatically refreshes every 30 seconds
- Last updated timestamp shown at bottom
- Manual refresh available via refresh button

### Navigation

Use the sidebar menu to navigate between sections:

- **Dashboard**: Overview and metrics (home)
- **Chat Logs Review**: Review AI conversations
- **Feedback Logs Review**: Review user feedback
- **Profile**: Your account settings
- **Sign Out**: End your session

## Reviewing Chat Logs

### Accessing Chat Logs

1. Click "Chat Logs Review" in the sidebar
2. You'll see a table of all chat log entries

### Understanding the Table

The chat logs table displays:

| Column | Description |
|--------|-------------|
| Log ID | Unique identifier for the log entry |
| Timestamp | When the conversation occurred |
| Carrier | Carrier name associated with the log |
| Question | User's question to the AI |
| Response | AI's response to the user |
| Status | Review status (Reviewed/Pending) |
| Actions | Button to open review modal |

### Reviewing a Chat Log

1. **Find the log** you want to review (use filters if needed)
2. **Click the "Review" button** in the Actions column
3. A modal dialog will open showing:
   - All log details (question, response, citation, etc.)
   - Review comment field
   - Review feedback field
4. **Read the conversation** carefully
5. **Enter your review comment** (up to 5000 characters)
   - Document your assessment
   - Note any issues or concerns
   - Provide constructive feedback
6. **Enter your review feedback** (up to 5000 characters)
   - Overall evaluation
   - Recommendations
   - Action items
7. **Click "Submit Review"**
8. Wait for confirmation message
9. The modal will close and the table will update

### Review Guidelines

When reviewing chat logs, consider:

- **Accuracy**: Is the AI's response factually correct?
- **Relevance**: Does the response address the user's question?
- **Completeness**: Is the response thorough and complete?
- **Clarity**: Is the response easy to understand?
- **Tone**: Is the tone appropriate and professional?
- **Citations**: Are sources properly cited?
- **Guardrails**: Did guardrails intervene appropriately?

### What to Document

In your review comments, include:

- **Strengths**: What the AI did well
- **Weaknesses**: Areas for improvement
- **Issues**: Any problems or errors
- **Context**: Relevant background information
- **Recommendations**: Suggested improvements

## Reviewing Feedback Logs

### Accessing Feedback Logs

1. Click "Feedback Logs Review" in the sidebar
2. You'll see a table of all feedback entries

### Understanding the Table

The feedback logs table displays:

| Column | Description |
|--------|-------------|
| ID | Unique identifier for the feedback |
| Datetime | When feedback was submitted |
| Carrier | Carrier name |
| Comments | User's comments |
| Feedback | User's feedback text |
| Question | Original question (if available) |
| Response | AI response (if available) |
| Status | Review status (Reviewed/Pending) |
| Actions | Button to open review modal |

### Reviewing Feedback

1. **Find the feedback** you want to review
2. **Click the "Review" button**
3. A modal dialog will open showing:
   - All feedback details
   - Original question and response (if available)
   - Review comment field
   - Review feedback field
4. **Read the user's feedback** carefully
5. **Enter your review comment**
   - Acknowledge the user's concerns
   - Document your assessment
   - Note any patterns or trends
6. **Enter your review feedback**
   - Action items
   - Follow-up needed
   - Resolution status
7. **Click "Submit Review"**
8. Wait for confirmation
9. The modal will close and table will update

### Feedback Review Guidelines

When reviewing feedback, consider:

- **Validity**: Is the feedback legitimate?
- **Severity**: How serious is the issue?
- **Frequency**: Is this a common complaint?
- **Actionability**: Can we address this feedback?
- **Priority**: How urgent is this issue?

## Filtering and Sorting

### Filtering Chat Logs

Use filters to narrow down the logs you see:

1. **Carrier Filter**
   - Click the carrier dropdown
   - Select a specific carrier
   - Only logs from that carrier will display

2. **Date Range Filter**
   - Click the start date picker
   - Select start date
   - Click the end date picker
   - Select end date
   - Only logs within that range will display

3. **Review Status Filter**
   - Click the status dropdown
   - Select "All", "Reviewed", or "Pending"
   - Table updates to show selected status

4. **Clear Filters**
   - Click "Clear Filters" button
   - All filters reset
   - All logs display

### Sorting

Click any column header to sort:

- **First click**: Sort ascending (A-Z, oldest-newest)
- **Second click**: Sort descending (Z-A, newest-oldest)
- **Third click**: Remove sort

### Pagination

Navigate through pages:

- **Page Size**: 50 entries per page
- **Next Page**: Click "Next" button
- **Previous Page**: Click "Previous" button
- **Page Number**: Shows current page and total pages

## Submitting Reviews

### Required Fields

- At least one of the following must be filled:
  - Review Comment
  - Review Feedback
- Both fields can be filled (recommended)

### Character Limits

- **Review Comment**: Maximum 5000 characters
- **Review Feedback**: Maximum 5000 characters
- Character counter shows remaining characters

### Input Validation

The system automatically:

- Prevents XSS attacks (sanitizes input)
- Enforces character limits
- Validates required fields
- Escapes special characters

### Submission Process

1. Fill in review fields
2. Click "Submit Review"
3. System validates input
4. If valid, sends to database
5. Shows success message
6. Updates table automatically
7. Modal closes

### If Submission Fails

If submission fails:

- Error message displays
- Your entered data is preserved
- You can correct and retry
- Check your internet connection
- Contact support if issue persists

## Best Practices

### Efficiency Tips

1. **Use Filters**: Narrow down logs before reviewing
2. **Sort by Status**: Review pending items first
3. **Batch Similar Items**: Review similar logs together
4. **Take Breaks**: Review quality decreases with fatigue
5. **Set Goals**: Aim for specific number of reviews per session

### Quality Tips

1. **Be Thorough**: Read entire conversation
2. **Be Objective**: Base assessment on facts
3. **Be Specific**: Provide detailed feedback
4. **Be Constructive**: Focus on improvement
5. **Be Consistent**: Use similar criteria for all reviews

### Documentation Tips

1. **Use Clear Language**: Write for future readers
2. **Include Examples**: Quote specific parts
3. **Note Patterns**: Identify recurring issues
4. **Suggest Solutions**: Provide actionable feedback
5. **Date Context**: Note time-sensitive information

### Time Management

- **Average Review Time**: 2-5 minutes per log
- **Daily Goal**: 50-100 reviews (depending on complexity)
- **Break Schedule**: 10 minutes every hour
- **Priority**: Focus on high-impact items first

## Keyboard Shortcuts

### Navigation

- **Tab**: Move to next field
- **Shift + Tab**: Move to previous field
- **Enter**: Submit form (when button focused)
- **Escape**: Close modal dialog

### Table Navigation

- **Arrow Keys**: Navigate table cells
- **Page Up**: Previous page
- **Page Down**: Next page
- **Home**: First page
- **End**: Last page

### General

- **Ctrl/Cmd + R**: Refresh page
- **Ctrl/Cmd + F**: Search (browser search)
- **Ctrl/Cmd + +**: Zoom in
- **Ctrl/Cmd + -**: Zoom out

## Troubleshooting

### Can't Sign In

**Problem**: Sign-in fails

**Solutions**:
1. Verify email address is correct
2. Check password (case-sensitive)
3. Try "Forgot Password" to reset
4. Clear browser cache and cookies
5. Try different browser
6. Contact administrator

### Data Not Loading

**Problem**: Tables show no data or loading spinner

**Solutions**:
1. Check internet connection
2. Refresh the page (Ctrl/Cmd + R)
3. Clear browser cache
4. Try different browser
5. Check if you're still signed in
6. Contact support if issue persists

### Can't Submit Review

**Problem**: Submit button doesn't work

**Solutions**:
1. Check required fields are filled
2. Verify character limits not exceeded
3. Check for error messages
4. Try refreshing the page
5. Check internet connection
6. Try again in a few minutes

### Filters Not Working

**Problem**: Filters don't change displayed data

**Solutions**:
1. Click "Apply Filters" button
2. Clear filters and reapply
3. Refresh the page
4. Check if data exists for filter criteria
5. Try different filter combination

### Slow Performance

**Problem**: Application is slow or unresponsive

**Solutions**:
1. Close other browser tabs
2. Clear browser cache
3. Check internet speed
4. Try different browser
5. Restart browser
6. Check system resources (CPU, memory)

## FAQ

### How often should I review logs?

Review logs regularly based on your role and workload. Daily reviews are recommended for active monitoring.

### Can I edit a review after submitting?

Yes, you can review the same log again and update your comments. The latest review will be saved.

### What happens to my review?

Your reviews are stored in the database and can be used for:
- AI training and improvement
- Quality assurance reports
- Performance metrics
- Trend analysis

### Can I export my reviews?

Export functionality is planned for a future release. Contact your administrator for current export options.

### How do I report a bug?

Contact your system administrator or support team with:
- Description of the issue
- Steps to reproduce
- Screenshots (if applicable)
- Browser and version
- Date and time of occurrence

### Can I review on mobile?

The application is responsive and works on mobile devices, but desktop is recommended for optimal experience.

### How long are reviews stored?

Reviews are stored indefinitely in the database. Retention policies are managed by your organization.

### Can multiple people review the same log?

Yes, multiple reviewers can review the same log. The most recent review is displayed.

### What if I disagree with an AI response?

Document your concerns in the review comment. Include:
- Why you disagree
- What the correct response should be
- Supporting evidence or sources

### How do I change my password?

1. Click your profile icon
2. Select "Change Password"
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click "Save"

## Getting Help

### Resources

- **This User Guide**: Comprehensive usage instructions
- **API Documentation**: Technical API reference
- **Troubleshooting Guide**: Common issues and solutions
- **System Administrator**: Your organization's admin contact

### Support Channels

1. **Documentation**: Check this guide first
2. **Administrator**: Contact your system admin
3. **Support Team**: Email support@example.com
4. **Training**: Request additional training if needed

### Feedback

We welcome your feedback on the system:

- Feature requests
- Usability improvements
- Bug reports
- Documentation suggestions

Contact your administrator to submit feedback.

## Quick Reference Card

### Common Tasks

| Task | Steps |
|------|-------|
| Sign In | Navigate to URL → Enter credentials → Click Sign In |
| Review Chat Log | Chat Logs Review → Find log → Click Review → Fill fields → Submit |
| Review Feedback | Feedback Logs Review → Find feedback → Click Review → Fill fields → Submit |
| Filter by Carrier | Select carrier from dropdown → Click Apply |
| Clear Filters | Click Clear Filters button |
| View Dashboard | Click Dashboard in sidebar |
| Sign Out | Click profile icon → Select Sign Out |

### Status Indicators

| Color | Meaning | Action |
|-------|---------|--------|
| 🟢 Green | >80% reviewed | Maintain pace |
| 🟡 Yellow | 40-80% reviewed | Increase effort |
| 🔴 Red | <40% reviewed | Priority focus |

### Character Limits

| Field | Limit |
|-------|-------|
| Review Comment | 5000 characters |
| Review Feedback | 5000 characters |

---

**Need Help?** Contact your system administrator or refer to the Troubleshooting section.

**Version**: 1.0.0  
**Last Updated**: December 2024
