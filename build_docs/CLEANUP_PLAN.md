# Project Cleanup Plan

## Files to DELETE (Unused/Temporary/Duplicate)

### Temporary/Debug Files
- [ ] `new-amplify-buildspec.yml` - Temporary file used during debugging
- [ ] `temp-template.yaml` - Temporary CloudFormation template
- [ ] `amplify-init-inputs.txt` - Old Amplify CLI input file (not needed)

### Duplicate/Obsolete Deployment Scripts
- [ ] `deploy-amplify.ps1` - Old Amplify CLI script (using Amplify Hosting now)
- [ ] `init-amplify.ps1` - Old Amplify CLI init script (not needed)
- [ ] `clean-and-init.ps1` - Old Amplify CLI cleanup script (not needed)
- [ ] `deploy-to-amplify-hosting.ps1` - Incomplete script (has syntax errors)
- [ ] `deploy-to-s3.ps1` - Complex version (keep simple version)
- [ ] `deploy-amplify-app.ps1` - Has syntax errors, not used

### Temporary Documentation Files
- [ ] `AMPLIFY_CONSOLE_FIX.txt` - Temporary fix instructions (issue resolved)
- [ ] `FIX_AMPLIFY_BUILD.md` - Temporary troubleshooting doc (issue resolved)
- [ ] `QUICK_AMPLIFY_SETUP.txt` - Temporary setup notes (consolidated into main docs)

### Duplicate Documentation
- [ ] `DEPLOYMENT_STEPS.md` - Duplicate of info in other docs
- [ ] `QUICK_DEPLOY.md` - Duplicate of info in other docs

## Files to KEEP

### Essential Configuration
✅ `.env*` files - Environment configuration
✅ `package.json` - Project dependencies
✅ `tsconfig*.json` - TypeScript configuration
✅ `vite.config.ts` - Build configuration
✅ `vitest.config.ts` - Test configuration
✅ `eslint.config.js` - Linting configuration
✅ `.prettierrc` - Code formatting
✅ `.gitignore` - Git configuration
✅ `amplify.yml` - Amplify Hosting build spec

### Active Deployment Scripts
✅ `deploy.sh` - Main CloudFormation deployment (bash)
✅ `deploy.cmd` - Windows wrapper
✅ `deploy-cloudformation.ps1` - CloudFormation deployment (PowerShell)
✅ `deploy-all.ps1` - Complete deployment orchestration
✅ `deploy-to-s3-simple.ps1` - Alternative S3 deployment
✅ `create-admin-user.ps1` - User management utility
✅ `update-env.ps1` - Environment variable updater

### Documentation (Keep & Consolidate)
✅ `README.md` - Main project documentation
✅ `SETUP.md` - Setup instructions
✅ `TESTING.md` - Testing documentation
✅ `DEPLOYMENT_SUCCESS.md` - Deployment reference
✅ `DEPLOYMENT_COMPLETE.md` - Final deployment guide
✅ `BACKEND_NOTE.md` - Backend architecture notes
✅ `CLOUD_DEPLOYMENT_GUIDE.md` - Cloud deployment options
✅ `AMPLIFY_SETUP_GUIDE.md` - Amplify Hosting guide

### Source Code & Assets
✅ `src/` - Application source code
✅ `public/` - Static assets
✅ `scripts/` - Build and deployment scripts
✅ `cloudformation/` - Infrastructure as Code
✅ `docs/` - Detailed documentation
✅ `.github/` - GitHub Actions workflows

### Build Artifacts (Already in .gitignore)
- `dist/` - Build output
- `node_modules/` - Dependencies
- `coverage/` - Test coverage
- `amplify/` - Amplify CLI (ignored)
- `amplify-backup/` - Amplify CLI backup (ignored)

## Recommended Actions

1. **Delete temporary/obsolete files** (listed above)
2. **Consolidate documentation** into main README
3. **Update .gitignore** to exclude temporary files
4. **Create a docs/archive/** folder for old docs (if needed for reference)

## Summary

**Files to Delete**: 12
**Files to Keep**: All essential project files
**Result**: Cleaner, more maintainable project structure
