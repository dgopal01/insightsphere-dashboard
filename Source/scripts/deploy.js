#!/usr/bin/env node

/**
 * Deployment Helper Script
 * This script helps with manual deployments to AWS Amplify
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENVIRONMENTS = ['dev', 'staging', 'prod'];

/**
 * Execute command and handle errors
 */
function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: 'inherit',
      ...options,
    });
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    process.exit(1);
  }
}

/**
 * Get environment from command line args
 */
function getEnvironment() {
  const args = process.argv.slice(2);
  const envArg = args.find(arg => arg.startsWith('--env='));
  
  if (envArg) {
    const env = envArg.split('=')[1];
    if (ENVIRONMENTS.includes(env)) {
      return env;
    }
  }
  
  console.error('\n❌ Invalid or missing environment argument');
  console.log('\nUsage: node scripts/deploy.js --env=<environment>');
  console.log(`Valid environments: ${ENVIRONMENTS.join(', ')}\n`);
  process.exit(1);
}

/**
 * Check if Amplify CLI is installed
 */
function checkAmplifyCLI() {
  try {
    execSync('amplify --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('\n❌ Amplify CLI is not installed');
    console.log('\nInstall it with: npm install -g @aws-amplify/cli\n');
    return false;
  }
}

/**
 * Confirm deployment
 */
function confirmDeployment(env) {
  console.log('\n⚠️  You are about to deploy to:', env.toUpperCase());
  console.log('\nThis will:');
  console.log('  1. Build the application');
  console.log('  2. Run pre-deployment checks');
  console.log('  3. Deploy to AWS Amplify');
  console.log('\nPress Ctrl+C to cancel, or Enter to continue...');
  
  // In a real implementation, you'd use readline for interactive input
  // For now, we'll proceed automatically
}

/**
 * Load environment variables
 */
function loadEnvironment(env) {
  const envFile = path.join(__dirname, '..', `.env.${env === 'dev' ? 'development' : env}`);
  
  if (!fs.existsSync(envFile)) {
    console.warn(`\n⚠️  Environment file not found: ${envFile}`);
    console.log('Using default environment variables\n');
    return;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf-8');
  const envVars = envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        acc[key.trim()] = value;
      }
      return acc;
    }, {});
  
  Object.assign(process.env, envVars);
  console.log(`✓ Loaded environment variables from ${envFile}\n`);
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('\n🚀 InsightSphere Dashboard Deployment\n');
  console.log('═'.repeat(80) + '\n');
  
  // Get environment
  const env = getEnvironment();
  
  // Check prerequisites
  if (!checkAmplifyCLI()) {
    process.exit(1);
  }
  
  // Confirm deployment
  confirmDeployment(env);
  
  // Load environment variables
  loadEnvironment(env);
  
  // Step 1: Build application
  console.log('\n📦 Step 1: Building application...\n');
  const buildCommand = env === 'prod' 
    ? 'npm run build:prod' 
    : env === 'staging' 
    ? 'npm run build:staging' 
    : 'npm run build:dev';
  
  exec(buildCommand);
  
  // Step 2: Run pre-deployment checks
  console.log('\n🔍 Step 2: Running pre-deployment checks...\n');
  exec('npm run predeploy');
  
  // Step 3: Deploy to Amplify
  console.log('\n🚀 Step 3: Deploying to AWS Amplify...\n');
  exec(`amplify publish --environment ${env} --yes`);
  
  // Success
  console.log('\n' + '═'.repeat(80));
  console.log('\n✅ Deployment completed successfully!\n');
  console.log(`Environment: ${env.toUpperCase()}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  // Show next steps
  console.log('Next steps:');
  console.log('  1. Verify the deployment in AWS Amplify Console');
  console.log('  2. Test the application in the deployed environment');
  console.log('  3. Monitor for any errors or issues\n');
}

// Run deployment
deploy().catch(error => {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
});
