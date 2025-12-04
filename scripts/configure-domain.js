#!/usr/bin/env node

/**
 * Custom Domain Configuration Script
 * This script helps configure custom domains for AWS Amplify
 */

import { execSync } from 'child_process';

const DOMAIN_CONFIG = {
  production: {
    domain: 'insightsphere.example.com',
    subdomain: 'www',
    branch: 'main',
  },
  staging: {
    domain: 'insightsphere.example.com',
    subdomain: 'staging',
    branch: 'staging',
  },
  development: {
    domain: 'insightsphere.example.com',
    subdomain: 'dev',
    branch: 'develop',
  },
};

/**
 * Display domain configuration instructions
 */
function displayInstructions() {
  console.log('\n🌐 Custom Domain Configuration Guide\n');
  console.log('═'.repeat(80) + '\n');
  
  console.log('To configure custom domains for InsightSphere Dashboard:\n');
  
  console.log('1. **AWS Amplify Console Configuration:**');
  console.log('   - Go to AWS Amplify Console');
  console.log('   - Select your app');
  console.log('   - Navigate to App Settings > Domain management');
  console.log('   - Click "Add domain"\n');
  
  console.log('2. **Domain Configuration:**\n');
  
  Object.entries(DOMAIN_CONFIG).forEach(([env, config]) => {
    console.log(`   ${env.toUpperCase()}:`);
    console.log(`   - Domain: ${config.domain}`);
    console.log(`   - Subdomain: ${config.subdomain}`);
    console.log(`   - Branch: ${config.branch}`);
    console.log(`   - Full URL: https://${config.subdomain}.${config.domain}\n`);
  });
  
  console.log('3. **DNS Configuration:**');
  console.log('   After adding the domain in Amplify Console, you will receive CNAME records.');
  console.log('   Add these records to your DNS provider:\n');
  
  console.log('   Example CNAME records:');
  console.log('   ```');
  console.log('   Type: CNAME');
  console.log('   Name: www');
  console.log('   Value: [provided-by-amplify].cloudfront.net');
  console.log('   ```\n');
  
  console.log('4. **SSL Certificate:**');
  console.log('   - Amplify automatically provisions SSL certificates');
  console.log('   - Certificate validation may take a few minutes');
  console.log('   - Ensure your domain is verified\n');
  
  console.log('5. **Update Environment Variables:**');
  console.log('   Update the following in your .env files:\n');
  
  Object.entries(DOMAIN_CONFIG).forEach(([env, config]) => {
    const envFile = env === 'development' ? '.env.development' : `.env.${env}`;
    console.log(`   ${envFile}:`);
    console.log(`   VITE_APP_URL=https://${config.subdomain}.${config.domain}\n`);
  });
  
  console.log('6. **Verification:**');
  console.log('   After DNS propagation (may take up to 48 hours):');
  console.log('   - Visit each URL to verify it works');
  console.log('   - Check SSL certificate is valid');
  console.log('   - Test authentication and API calls\n');
  
  console.log('7. **Redirect Configuration:**');
  console.log('   Configure redirects in Amplify Console:');
  console.log('   - Redirect HTTP to HTTPS');
  console.log('   - Redirect apex domain to www (if applicable)');
  console.log('   - Configure SPA redirects for client-side routing\n');
  
  console.log('═'.repeat(80) + '\n');
  
  console.log('📝 Additional Resources:\n');
  console.log('   - AWS Amplify Custom Domains:');
  console.log('     https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html');
  console.log('   - DNS Configuration Guide:');
  console.log('     https://docs.aws.amazon.com/amplify/latest/userguide/to-add-a-custom-domain.html\n');
}

/**
 * Generate Amplify redirect rules
 */
function generateRedirectRules() {
  console.log('\n📋 Amplify Redirect Rules\n');
  console.log('Add these rules to your Amplify Console under App Settings > Rewrites and redirects:\n');
  
  const rules = [
    {
      source: '/<*>',
      target: '/index.html',
      status: '200',
      condition: null,
      description: 'SPA fallback - serve index.html for all routes',
    },
    {
      source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>',
      target: '/index.html',
      status: '200',
      condition: null,
      description: 'SPA fallback - handle client-side routing',
    },
  ];
  
  console.log('```json');
  console.log(JSON.stringify(rules, null, 2));
  console.log('```\n');
}

/**
 * Check domain availability
 */
function checkDomainAvailability() {
  console.log('\n🔍 Checking domain configuration...\n');
  
  Object.entries(DOMAIN_CONFIG).forEach(([env, config]) => {
    const url = `https://${config.subdomain}.${config.domain}`;
    console.log(`${env.toUpperCase()}: ${url}`);
    
    try {
      // Note: This is a placeholder. In a real implementation,
      // you would use a DNS lookup or HTTP request to check availability
      console.log('  Status: Not configured (run this after domain setup)\n');
    } catch (error) {
      console.log('  Status: Error checking domain\n');
    }
  });
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--check')) {
    checkDomainAvailability();
  } else if (args.includes('--redirects')) {
    generateRedirectRules();
  } else {
    displayInstructions();
  }
}

main();
