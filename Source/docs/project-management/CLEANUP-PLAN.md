# Project Cleanup and Organization Plan

## Current Issues

### 1. Duplicate Deployment Infrastructure
- `k8s/` directory contains old EKS deployment files
- `eks-deployment/` directory contains the new organized EKS deployment
- **Action**: Remove `k8s/` directory entirely

### 2. Excessive Documentation
- `build_docs/` - Contains 30+ build-related documentation files (mostly outdated)
- `docs/` - Contains general documentation (some overlap with build_docs)
- `archive/` - Contains archived components
- **Action**: Consolidate and remove outdated documentation

### 3. Unused Scripts
- Many PowerShell scripts not referenced in package.json
- Multiple deployment scripts for different platforms
- **Action**: Keep only actively used scripts

### 4. Build Artifacts and Temporary Files
- `dist/` directory contains build output
- **Action**: Clean build artifacts

### 5. Duplicate Configuration Files
- Multiple Docker files and configurations
- Duplicate environment files
- **Action**: Remove duplicates, keep organized versions

### 6. Legacy Files
- Old Amplify configuration files (since migrating to EKS)
- Unused sample applications
- **Action**: Archive or remove legacy files

## Cleanup Actions

### Phase 1: Remove Duplicate EKS Files
- [x] Remove `k8s/` directory (superseded by `eks-deployment/`)
- [x] Remove duplicate Dockerfile in root (use `eks-deployment/docker/Dockerfile`)
- [x] Remove duplicate .dockerignore in root

### Phase 2: Documentation Cleanup
- [x] Remove `build_docs/` directory (outdated build documentation)
- [x] Consolidate `docs/` directory
- [x] Remove duplicate markdown files in root

### Phase 3: Script Cleanup
- [x] Remove unused PowerShell scripts
- [x] Keep only scripts referenced in package.json
- [x] Remove legacy deployment scripts

### Phase 4: Build and Temporary File Cleanup
- [x] Remove `dist/` directory
- [x] Clean up temporary files

### Phase 5: Legacy File Cleanup
- [x] Archive or remove unused Amplify files
- [x] Remove sample applications
- [x] Clean up unused configuration files

## Files to Keep

### Core Application Files
- `src/` - Main application source code
- `public/` - Public assets
- `package.json`, `package-lock.json` - Dependencies
- Configuration files: `vite.config.ts`, `tsconfig.json`, etc.
- Environment files: `.env*`

### EKS Deployment
- `eks-deployment/` - Complete EKS deployment solution

### Essential Scripts (Referenced in package.json)
- `scripts/analyze-bundle.js`
- `scripts/build-optimize.js`
- `scripts/configure-domain.js`
- `scripts/deploy.js`
- `scripts/health-check.js`
- `scripts/pre-deploy.js`
- `scripts/test-build.js`

### Documentation
- `README.md` - Main project documentation
- `eks-deployment/` documentation

### CloudFormation (if still needed)
- `cloudformation/` - AWS infrastructure templates
- `lambda/` - Lambda functions

## Files to Remove

### Duplicate EKS Files
- `k8s/` directory
- Root `Dockerfile`
- Root `.dockerignore`
- `EKS-DEPLOYMENT-PLAN.md` (moved to eks-deployment/)

### Outdated Documentation
- `build_docs/` directory
- `archive/` directory
- Duplicate markdown files

### Unused Scripts
- PowerShell scripts not in package.json
- Legacy deployment scripts

### Build Artifacts
- `dist/` directory

### Legacy/Unused Files
- `sample_app/` directory
- Unused configuration files