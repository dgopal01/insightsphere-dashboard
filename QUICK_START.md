# Quick Start Guide

## Option 1: Local Development (No AWS Required)

Perfect for testing the UI and development:

```powershell
# Start local development server
.\scripts\start-local.ps1
```

Access at: http://localhost:5173

**Note:** Without AWS backend, you'll see the UI but won't be able to fetch real data.

---

## Option 2: Full AWS Deployment

### Prerequisites

1. **Install AWS CLI:**
   ```bash
   # Download from: https://aws.amazon.com/cli/
   aws --version
   ```

2. **Configure AWS Credentials:**
   ```bash
   aws configure
   # Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
   ```

3. **Verify AWS Access:**
   ```bash
   aws sts get-caller-identity
   ```

### Deploy

```powershell
cd scripts

# Deploy everything (replace with your email)
.\deploy-all.ps1 -AdminEmail "your-email@example.com" -Environment dev
```

**What it does:**
- Creates Cognito User Pool for authentication
- Sets up AppSync GraphQL API
- Creates DynamoDB tables
- Deploys Lambda functions
- Creates admin user
- Configures environment files

**Time:** 10-15 minutes

### After Deployment

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Access:** http://localhost:5173

3. **Login:**
   - Username: `admin`
   - Password: `TempPass123!`
   - You'll be prompted to change the password

---

## Option 3: Just Build (No Server)

```bash
# Build for production
npm run build:prod

# Build output in dist/
```

---

## Troubleshooting

### AWS CLI Not Found
```bash
# Windows: Download installer from https://aws.amazon.com/cli/
# Or use: choco install awscli
```

### AWS Credentials Not Configured
```bash
aws configure
# You need: Access Key ID and Secret Access Key from AWS Console
```

### PowerShell Script Execution Error
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port 5173 Already in Use
```bash
# Kill the process using the port
# Or the dev server will automatically use the next available port
```

---

## Next Steps

- **Documentation:** See `build_docs/` for detailed guides
- **Scripts:** See `scripts/README.md` for all available scripts
- **Deployment:** See `build_docs/DEPLOYMENT_GUIDE.md` for full deployment options

---

## Quick Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build:prod

# Type check
npm run type-check

# Lint code
npm run lint
```

---

**Ready to start?** Run `.\scripts\start-local.ps1` for local development!
