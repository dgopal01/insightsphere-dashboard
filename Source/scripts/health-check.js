#!/usr/bin/env node

/**
 * Post-Deployment Health Check Script
 * This script verifies the deployment is healthy and functional
 */

import https from 'https';
import { URL } from 'url';

const ENVIRONMENTS = {
  dev: 'https://dev.insightsphere.example.com',
  staging: 'https://staging.insightsphere.example.com',
  prod: 'https://insightsphere.example.com',
};

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname,
      method: 'GET',
      timeout: 10000,
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Check if URL is accessible
 */
async function checkAccessibility(url) {
  try {
    const response = await makeRequest(url);
    return {
      success: response.statusCode === 200,
      statusCode: response.statusCode,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: null,
      error: error.message,
    };
  }
}

/**
 * Check security headers
 */
async function checkSecurityHeaders(url) {
  try {
    const response = await makeRequest(url);
    const headers = response.headers;
    
    const requiredHeaders = {
      'strict-transport-security': 'HSTS',
      'x-content-type-options': 'X-Content-Type-Options',
      'x-frame-options': 'X-Frame-Options',
      'x-xss-protection': 'X-XSS-Protection',
    };
    
    const results = {};
    
    for (const [header, name] of Object.entries(requiredHeaders)) {
      results[name] = {
        present: !!headers[header],
        value: headers[header] || null,
      };
    }
    
    return results;
  } catch (error) {
    return null;
  }
}

/**
 * Check build info
 */
async function checkBuildInfo(url) {
  try {
    const buildInfoUrl = `${url}/build-info.json`;
    const response = await makeRequest(buildInfoUrl);
    
    if (response.statusCode === 200) {
      const buildInfo = JSON.parse(response.body);
      return {
        success: true,
        buildInfo,
      };
    }
    
    return {
      success: false,
      error: 'Build info not found',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Run health checks for an environment
 */
async function runHealthChecks(env, url) {
  console.log(`\n🔍 Checking ${env.toUpperCase()} environment...\n`);
  console.log(`URL: ${url}\n`);
  
  let allChecksPassed = true;
  
  // Check 1: Accessibility
  console.log('1. Accessibility Check');
  const accessCheck = await checkAccessibility(url);
  if (accessCheck.success) {
    console.log(`   ✅ Site is accessible (Status: ${accessCheck.statusCode})`);
  } else {
    console.log(`   ❌ Site is not accessible`);
    console.log(`   Error: ${accessCheck.error || 'Unknown error'}`);
    allChecksPassed = false;
  }
  
  // Check 2: Security Headers
  console.log('\n2. Security Headers Check');
  const securityHeaders = await checkSecurityHeaders(url);
  if (securityHeaders) {
    for (const [name, result] of Object.entries(securityHeaders)) {
      if (result.present) {
        console.log(`   ✅ ${name}: ${result.value}`);
      } else {
        console.log(`   ⚠️  ${name}: Not present`);
      }
    }
  } else {
    console.log('   ⚠️  Could not check security headers');
  }
  
  // Check 3: Build Info
  console.log('\n3. Build Info Check');
  const buildInfo = await checkBuildInfo(url);
  if (buildInfo.success) {
    console.log('   ✅ Build info available');
    console.log(`   Environment: ${buildInfo.buildInfo.environment || 'unknown'}`);
    console.log(`   Version: ${buildInfo.buildInfo.version || 'unknown'}`);
    console.log(`   Build Time: ${buildInfo.buildInfo.buildTime || 'unknown'}`);
  } else {
    console.log('   ⚠️  Build info not available');
    console.log(`   Error: ${buildInfo.error}`);
  }
  
  console.log('\n' + '─'.repeat(80));
  
  return allChecksPassed;
}

/**
 * Main function
 */
async function main() {
  console.log('\n🏥 InsightSphere Dashboard Health Check\n');
  console.log('═'.repeat(80));
  
  const args = process.argv.slice(2);
  const envArg = args.find(arg => arg.startsWith('--env='));
  
  let envsToCheck = [];
  
  if (envArg) {
    const env = envArg.split('=')[1];
    if (ENVIRONMENTS[env]) {
      envsToCheck = [[env, ENVIRONMENTS[env]]];
    } else {
      console.error(`\n❌ Invalid environment: ${env}`);
      console.log(`Valid environments: ${Object.keys(ENVIRONMENTS).join(', ')}\n`);
      process.exit(1);
    }
  } else {
    envsToCheck = Object.entries(ENVIRONMENTS);
  }
  
  let allPassed = true;
  
  for (const [env, url] of envsToCheck) {
    const passed = await runHealthChecks(env, url);
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n' + '═'.repeat(80));
  
  if (allPassed) {
    console.log('\n✅ All health checks passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some health checks failed. Please review the results above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Health check failed:', error.message);
  process.exit(1);
});
