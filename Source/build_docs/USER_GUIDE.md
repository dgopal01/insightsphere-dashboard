# InsightSphere Dashboard - User Guide

## 🎉 Welcome!

You're now logged into the InsightSphere Dashboard - a comprehensive AI performance and feedback web application.

## 📍 Navigation

The app has three main sections accessible from the left sidebar:

### 1. 📊 Dashboard
**Path**: `/dashboard` or `/`

**What you'll see**:
- **Performance Metrics Cards**:
  - Average Accuracy Score
  - Average Satisfaction Rating
  - Average Response Time
  - Total Conversations
- **Interactive Charts**:
  - Accuracy Trend (line chart)
  - Satisfaction Distribution (bar chart)
  - Response Time Trend (area chart)
- **Real-time Updates**: Data refreshes automatically

**Use this for**: Quick overview of AI chatbot performance

---

### 2. 💬 Chat Logs
**Path**: `/logs`

**What you'll see**:
- **Searchable Table** of all AI conversation logs
- **Columns**:
  - Conversation ID
  - User Message
  - AI Response
  - Timestamp
  - Actions (View Details)
- **Features**:
  - Search by conversation ID, user message, or AI response
  - Sort by any column
  - Pagination (10 logs per page)
  - Export to CSV
  - View detailed conversation

**Use this for**: 
- Reviewing specific conversations
- Searching for particular interactions
- Exporting data for analysis
- Quality assurance

---

### 3. 📝 Feedback
**Path**: `/feedback`

**What you'll see**:
- **Feedback Table** showing all user feedback
- **Columns**:
  - Log ID (linked conversation)
  - Rating (1-5 stars)
  - Comment
  - Timestamp
  - User
- **Submit New Feedback** button
- **Features**:
  - View all feedback
  - Submit new feedback
  - Filter and sort
  - Pagination

**Use this for**:
- Viewing user feedback on AI responses
- Submitting feedback on conversations
- Identifying areas for improvement

---

## 🔍 How to View Logs

### Method 1: From the Sidebar
1. Click **"Chat Logs"** in the left sidebar
2. Browse the table of conversations
3. Use the search box to find specific logs
4. Click on any row to view details

### Method 2: From the Dashboard
1. View the dashboard metrics
2. Click on any chart data point (if implemented)
3. Navigate to related logs

### Method 3: Search
1. Go to Chat Logs page
2. Type in the search box:
   - Conversation ID
   - Part of user message
   - Part of AI response
3. Results filter in real-time

---

## 📤 Exporting Data

### Export Chat Logs to CSV
1. Go to **Chat Logs** page
2. Click the **"Export CSV"** button (top right)
3. File downloads automatically
4. Open in Excel, Google Sheets, or any CSV viewer

**CSV includes**:
- Conversation ID
- User Message
- AI Response
- Timestamp
- Metadata

---

## 🎯 Key Features

### Real-time Updates
- Dashboard metrics update automatically
- New logs appear without refresh
- Uses GraphQL subscriptions

### Search & Filter
- Instant search across all fields
- Case-insensitive matching
- Highlights matching text

### Responsive Design
- Works on desktop, tablet, and mobile
- Sidebar collapses on mobile
- Touch-friendly interface

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators

---

## 👤 User Roles

### Admin (Your Current Role)
**Permissions**:
- ✅ View all logs
- ✅ View all feedback
- ✅ Submit feedback
- ✅ Export data
- ✅ View all metrics
- ✅ Access all features

### Viewer
**Permissions**:
- ✅ View logs (read-only)
- ✅ View feedback (read-only)
- ✅ View metrics
- ❌ Cannot submit feedback
- ❌ Cannot export data

---

## 🔐 Account Management

### Change Password
1. Click your profile icon (top right)
2. Select **"Change Password"**
3. Enter current and new password
4. Save changes

### Sign Out
1. Click your profile icon (top right)
2. Select **"Sign Out"**
3. You'll be redirected to sign-in page

---

## 📊 Understanding the Data

### Chat Logs
**What they contain**:
- User questions/messages to the AI
- AI responses
- Conversation context
- Timestamps
- Metadata (model version, tokens, etc.)

**Data source**: 
- DynamoDB table: `insightsphere-dev-chatlogs`
- Read-only access (logs are created by the AI system)

### Feedback
**What it contains**:
- User ratings (1-5 stars)
- Comments on AI responses
- Linked to specific chat logs
- Timestamp and user info

**Data source**:
- DynamoDB table: `insightsphere-dev-feedback`
- Full CRUD access (you can create, read, update, delete)

### Metrics
**Calculated from**:
- Accuracy scores from chat logs
- User satisfaction ratings from feedback
- Response times from chat logs
- Aggregated in real-time

---

## 🐛 Troubleshooting

### No Logs Showing
**Possible causes**:
1. No data in the database yet
2. Network connectivity issue
3. GraphQL API error

**Solutions**:
- Check browser console (F12) for errors
- Refresh the page
- Check your internet connection
- Contact admin if issue persists

### Can't Export CSV
**Possible causes**:
1. Browser blocking downloads
2. S3 permissions issue
3. No data to export

**Solutions**:
- Allow downloads in browser settings
- Check browser console for errors
- Ensure you have data to export

### Search Not Working
**Possible causes**:
1. JavaScript error
2. No matching results

**Solutions**:
- Try different search terms
- Clear search and try again
- Refresh the page

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- **Tab**: Navigate between elements
- **Enter**: Activate buttons/links
- **Escape**: Close dialogs/modals
- **Arrow Keys**: Navigate tables

### Best Practices
1. **Regular Exports**: Export logs weekly for backup
2. **Provide Feedback**: Help improve AI by rating responses
3. **Use Search**: Find specific conversations quickly
4. **Monitor Trends**: Check dashboard regularly for patterns

### Performance
- Dashboard loads ~1000 recent logs
- Search is client-side (instant)
- Pagination improves performance
- Real-time updates use minimal bandwidth

---

## 📱 Mobile Usage

### On Mobile Devices
1. **Menu**: Tap hamburger icon (☰) to open sidebar
2. **Navigation**: Tap menu items to navigate
3. **Tables**: Scroll horizontally to see all columns
4. **Search**: Tap search box to open keyboard
5. **Export**: Downloads work on mobile browsers

---

## 🆘 Need Help?

### Resources
- **This Guide**: `USER_GUIDE.md`
- **Technical Docs**: `README.md`
- **Deployment Info**: `DEPLOYMENT_COMPLETE.md`
- **Troubleshooting**: `TROUBLESHOOTING_AUTH.md`

### Support
- Check browser console for errors (F12)
- Review CloudWatch logs for backend issues
- Contact your system administrator

---

## 🎓 Quick Start Checklist

- [x] ✅ Logged in successfully
- [ ] 📊 Viewed the Dashboard
- [ ] 💬 Browsed Chat Logs
- [ ] 🔍 Tried searching logs
- [ ] 📤 Exported data to CSV
- [ ] 📝 Viewed Feedback
- [ ] ⭐ Submitted feedback (optional)
- [ ] 🔐 Changed password (recommended)

---

**Current Session**:
- **User**: dgopal@swbc.com
- **Role**: Admin
- **Environment**: Development
- **App URL**: https://main.d33feletv96fod.amplifyapp.com

**Enjoy using InsightSphere Dashboard!** 🚀
