#!/usr/bin/env node

/**
 * Build Optimization Script
 * This script performs additional optimizations after the Vite build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzip } from 'zlib';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gzipAsync = promisify(gzip);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SIZE_LIMIT_KB = 500;

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Get gzipped file size
 */
async function getGzippedSize(filePath) {
  const content = fs.readFileSync(filePath);
  const gzipped = await gzipAsync(content);
  return (gzipped.length / 1024).toFixed(2);
}

/**
 * Analyze bundle sizes
 */
async function analyzeBundleSizes() {
  console.log('\n📊 Analyzing bundle sizes...\n');

  const jsFiles = [];
  const cssFiles = [];

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.js')) {
        jsFiles.push(filePath);
      } else if (file.endsWith('.css')) {
        cssFiles.push(filePath);
      }
    }
  }

  walkDir(DIST_DIR);

  let totalSize = 0;
  let totalGzippedSize = 0;
  let hasWarnings = false;

  console.log('JavaScript Files:');
  console.log('─'.repeat(80));
  
  for (const file of jsFiles) {
    const size = parseFloat(getFileSizeKB(file));
    const gzippedSize = parseFloat(await getGzippedSize(file));
    const relativePath = path.relative(DIST_DIR, file);
    
    totalSize += size;
    totalGzippedSize += gzippedSize;
    
    const warning = gzippedSize > SIZE_LIMIT_KB ? ' ⚠️  EXCEEDS LIMIT' : '';
    if (warning) hasWarnings = true;
    
    console.log(`  ${relativePath}`);
    console.log(`    Size: ${size} KB | Gzipped: ${gzippedSize} KB${warning}`);
  }

  console.log('\nCSS Files:');
  console.log('─'.repeat(80));
  
  for (const file of cssFiles) {
    const size = parseFloat(getFileSizeKB(file));
    const gzippedSize = parseFloat(await getGzippedSize(file));
    const relativePath = path.relative(DIST_DIR, file);
    
    totalSize += size;
    totalGzippedSize += gzippedSize;
    
    console.log(`  ${relativePath}`);
    console.log(`    Size: ${size} KB | Gzipped: ${gzippedSize} KB`);
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`Total Size: ${totalSize.toFixed(2)} KB | Total Gzipped: ${totalGzippedSize.toFixed(2)} KB`);
  console.log('═'.repeat(80) + '\n');

  if (hasWarnings) {
    console.warn('⚠️  Warning: Some files exceed the recommended size limit of', SIZE_LIMIT_KB, 'KB (gzipped)');
    console.warn('   Consider code splitting or lazy loading for large chunks.\n');
  }

  if (totalGzippedSize > SIZE_LIMIT_KB) {
    console.log('✅ Total bundle size is within acceptable limits\n');
  }

  return { totalSize, totalGzippedSize, hasWarnings };
}

/**
 * Generate build report
 */
async function generateBuildReport() {
  const { totalSize, totalGzippedSize, hasWarnings } = await analyzeBundleSizes();
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.VITE_ENV || 'development',
    totalSize: `${totalSize.toFixed(2)} KB`,
    totalGzippedSize: `${totalGzippedSize.toFixed(2)} KB`,
    sizeLimit: `${SIZE_LIMIT_KB} KB`,
    withinLimit: totalGzippedSize <= SIZE_LIMIT_KB,
    hasWarnings,
    buildInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  };

  const reportPath = path.join(DIST_DIR, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Build report generated:', reportPath, '\n');
  
  return report;
}

/**
 * Optimize HTML files
 */
function optimizeHTML() {
  console.log('🔧 Optimizing HTML files...\n');
  
  const htmlFiles = fs.readdirSync(DIST_DIR).filter(file => file.endsWith('.html'));
  
  for (const file of htmlFiles) {
    const filePath = path.join(DIST_DIR, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Add preconnect hints for external resources
    const preconnects = [
      '<link rel="preconnect" href="https://cognito-idp.us-east-1.amazonaws.com">',
      '<link rel="preconnect" href="https://appsync-api.us-east-1.amazonaws.com">',
    ];
    
    content = content.replace('</head>', `  ${preconnects.join('\n  ')}\n</head>`);
    
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Optimized ${file}`);
  }
  
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Running build optimizations...\n');
  
  try {
    // Check if dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      console.error('❌ Error: dist directory not found. Please run build first.');
      process.exit(1);
    }
    
    // Run optimizations
    optimizeHTML();
    const report = await generateBuildReport();
    
    console.log('✅ Build optimization complete!\n');
    
    // Exit with error code if there are warnings in production
    if (process.env.VITE_ENV === 'production' && report.hasWarnings) {
      console.error('❌ Build failed: Bundle size warnings in production build');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during build optimization:', error);
    process.exit(1);
  }
}

main();
