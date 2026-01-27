#!/usr/bin/env node

/**
 * Pre-deployment Script
 * This script runs checks before deployment to ensure the build is ready
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const REQUIRED_FILES = ['index.html', 'build-info.json'];

/**
 * Check if required files exist
 */
function checkRequiredFiles() {
  console.log('📋 Checking required files...\n');
  
  let allFilesExist = true;
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(DIST_DIR, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      console.log(`  ✓ ${file}`);
    } else {
      console.error(`  ✗ ${file} - MISSING`);
      allFilesExist = false;
    }
  }
  
  console.log('');
  return allFilesExist;
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');
  
  const requiredEnvVars = [
    'VITE_ENV',
    'VITE_AWS_REGION',
    'VITE_USER_POOL_ID',
    'VITE_USER_POOL_CLIENT_ID',
    'VITE_GRAPHQL_ENDPOINT',
    'VITE_S3_BUCKET',
  ];
  
  let allVarsPresent = true;
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    
    if (value && value !== '' && !value.includes('XXXXXXXXX')) {
      console.log(`  ✓ ${envVar}`);
    } else {
      console.warn(`  ⚠️  ${envVar} - Not configured or using placeholder`);
      if (process.env.VITE_ENV === 'production') {
        allVarsPresent = false;
      }
    }
  }
  
  console.log('');
  return allVarsPresent;
}

/**
 * Run security checks
 */
function runSecurityChecks() {
  console.log('🔒 Running security checks...\n');
  
  try {
    // Check for sensitive data in build output
    const distFiles = getAllFiles(DIST_DIR);
    const sensitivePatterns = [
      /aws_secret_access_key/i,
      /password\s*=\s*['"][^'"]+['"]/i,
      /api_key\s*=\s*['"][^'"]+['"]/i,
    ];
    
    let foundSensitiveData = false;
    
    for (const file of distFiles) {
      if (file.endsWith('.js') || file.endsWith('.html')) {
        const content = fs.readFileSync(file, 'utf-8');
        
        for (const pattern of sensitivePatterns) {
          if (pattern.test(content)) {
            console.error(`  ✗ Potential sensitive data found in ${path.relative(DIST_DIR, file)}`);
            foundSensitiveData = true;
          }
        }
      }
    }
    
    if (!foundSensitiveData) {
      console.log('  ✓ No sensitive data detected in build output');
    }
    
    console.log('');
    return !foundSensitiveData;
    
  } catch (error) {
    console.error('  ✗ Error running security checks:', error.message);
    return false;
  }
}

/**
 * Get all files recursively
 */
function getAllFiles(dir) {
  const files = [];
  
  function walk(directory) {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

/**
 * Verify build integrity
 */
function verifyBuildIntegrity() {
  console.log('🔍 Verifying build integrity...\n');
  
  try {
    const buildInfoPath = path.join(DIST_DIR, 'build-info.json');
    
    if (fs.existsSync(buildInfoPath)) {
      const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf-8'));
      
      console.log('  Build Information:');
      console.log(`    Environment: ${buildInfo.environment || 'unknown'}`);
      console.log(`    Build Time: ${buildInfo.buildTime || 'unknown'}`);
      console.log(`    Version: ${buildInfo.version || 'unknown'}`);
      
      // Verify environment matches
      if (process.env.VITE_ENV && buildInfo.environment !== process.env.VITE_ENV) {
        console.warn(`  ⚠️  Environment mismatch: Expected ${process.env.VITE_ENV}, got ${buildInfo.environment}`);
        return false;
      }
      
      console.log('  ✓ Build integrity verified');
    } else {
      console.warn('  ⚠️  build-info.json not found');
      return false;
    }
    
    console.log('');
    return true;
    
  } catch (error) {
    console.error('  ✗ Error verifying build integrity:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Running pre-deployment checks...\n');
  console.log('═'.repeat(80) + '\n');
  
  const checks = [
    { name: 'Required Files', fn: checkRequiredFiles },
    { name: 'Environment Variables', fn: validateEnvironment },
    { name: 'Security', fn: runSecurityChecks },
    { name: 'Build Integrity', fn: verifyBuildIntegrity },
  ];
  
  let allChecksPassed = true;
  
  for (const check of checks) {
    const passed = check.fn();
    
    if (!passed) {
      allChecksPassed = false;
      console.error(`❌ ${check.name} check failed\n`);
    }
  }
  
  console.log('═'.repeat(80) + '\n');
  
  if (allChecksPassed) {
    console.log('✅ All pre-deployment checks passed!\n');
    console.log('🚀 Ready for deployment\n');
    process.exit(0);
  } else {
    console.error('❌ Some pre-deployment checks failed\n');
    console.error('Please fix the issues before deploying\n');
    process.exit(1);
  }
}

main();
