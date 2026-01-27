#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the production build bundle size and composition
 * Requirements: 12.3, 12.4
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const SIZE_LIMITS = {
  js: 500 * 1024, // 500 KB per JS chunk
  css: 100 * 1024, // 100 KB per CSS file
  total: 2 * 1024 * 1024, // 2 MB total
};

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push({
          path: filePath,
          name: file,
          size: stat.size,
          ext: extname(file),
        });
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return fileList;
}

/**
 * Analyze bundle
 */
function analyzeBundle() {
  console.log('📊 Bundle Analysis Report\n');
  console.log('=' .repeat(70));

  try {
    const files = getAllFiles(DIST_DIR);
    
    if (files.length === 0) {
      console.log('\n❌ No build files found. Run "npm run build" first.\n');
      process.exit(1);
    }

    // Group files by type
    const filesByType = {
      js: files.filter((f) => f.ext === '.js'),
      css: files.filter((f) => f.ext === '.css'),
      html: files.filter((f) => f.ext === '.html'),
      assets: files.filter((f) => !['.js', '.css', '.html'].includes(f.ext)),
    };

    // Calculate totals
    const totals = {
      js: filesByType.js.reduce((sum, f) => sum + f.size, 0),
      css: filesByType.css.reduce((sum, f) => sum + f.size, 0),
      html: filesByType.html.reduce((sum, f) => sum + f.size, 0),
      assets: filesByType.assets.reduce((sum, f) => sum + f.size, 0),
    };
    const totalSize = Object.values(totals).reduce((sum, size) => sum + size, 0);

    // Print JavaScript files
    console.log('\n📦 JavaScript Files:');
    console.log('-'.repeat(70));
    filesByType.js
      .sort((a, b) => b.size - a.size)
      .forEach((file) => {
        const sizeStr = formatBytes(file.size).padEnd(12);
        const warning = file.size > SIZE_LIMITS.js ? ' ⚠️  LARGE' : '';
        console.log(`  ${sizeStr} ${file.name}${warning}`);
      });
    console.log(`  ${'─'.repeat(70)}`);
    console.log(`  ${formatBytes(totals.js).padEnd(12)} Total JS`);

    // Print CSS files
    console.log('\n🎨 CSS Files:');
    console.log('-'.repeat(70));
    filesByType.css
      .sort((a, b) => b.size - a.size)
      .forEach((file) => {
        const sizeStr = formatBytes(file.size).padEnd(12);
        const warning = file.size > SIZE_LIMITS.css ? ' ⚠️  LARGE' : '';
        console.log(`  ${sizeStr} ${file.name}${warning}`);
      });
    console.log(`  ${'─'.repeat(70)}`);
    console.log(`  ${formatBytes(totals.css).padEnd(12)} Total CSS`);

    // Print HTML files
    console.log('\n📄 HTML Files:');
    console.log('-'.repeat(70));
    filesByType.html.forEach((file) => {
      const sizeStr = formatBytes(file.size).padEnd(12);
      console.log(`  ${sizeStr} ${file.name}`);
    });
    console.log(`  ${'─'.repeat(70)}`);
    console.log(`  ${formatBytes(totals.html).padEnd(12)} Total HTML`);

    // Print assets
    if (filesByType.assets.length > 0) {
      console.log('\n🖼️  Assets:');
      console.log('-'.repeat(70));
      filesByType.assets
        .sort((a, b) => b.size - a.size)
        .slice(0, 10) // Show top 10 largest assets
        .forEach((file) => {
          const sizeStr = formatBytes(file.size).padEnd(12);
          console.log(`  ${sizeStr} ${file.name}`);
        });
      if (filesByType.assets.length > 10) {
        console.log(`  ... and ${filesByType.assets.length - 10} more files`);
      }
      console.log(`  ${'─'.repeat(70)}`);
      console.log(`  ${formatBytes(totals.assets).padEnd(12)} Total Assets`);
    }

    // Print summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(70));
    console.log(`  JavaScript:  ${formatBytes(totals.js).padEnd(12)} (${((totals.js / totalSize) * 100).toFixed(1)}%)`);
    console.log(`  CSS:         ${formatBytes(totals.css).padEnd(12)} (${((totals.css / totalSize) * 100).toFixed(1)}%)`);
    console.log(`  HTML:        ${formatBytes(totals.html).padEnd(12)} (${((totals.html / totalSize) * 100).toFixed(1)}%)`);
    console.log(`  Assets:      ${formatBytes(totals.assets).padEnd(12)} (${((totals.assets / totalSize) * 100).toFixed(1)}%)`);
    console.log(`  ${'─'.repeat(70)}`);
    const totalWarning = totalSize > SIZE_LIMITS.total ? ' ⚠️  EXCEEDS LIMIT' : ' ✓';
    console.log(`  Total:       ${formatBytes(totalSize).padEnd(12)}${totalWarning}`);

    // Print recommendations
    console.log('\n💡 Recommendations:');
    console.log('='.repeat(70));
    
    const largeJsFiles = filesByType.js.filter((f) => f.size > SIZE_LIMITS.js);
    if (largeJsFiles.length > 0) {
      console.log(`  ⚠️  ${largeJsFiles.length} JavaScript file(s) exceed 500 KB`);
      console.log('     Consider code splitting or lazy loading');
    }
    
    const largeCssFiles = filesByType.css.filter((f) => f.size > SIZE_LIMITS.css);
    if (largeCssFiles.length > 0) {
      console.log(`  ⚠️  ${largeCssFiles.length} CSS file(s) exceed 100 KB`);
      console.log('     Consider CSS code splitting or removing unused styles');
    }
    
    if (totalSize > SIZE_LIMITS.total) {
      console.log('  ⚠️  Total bundle size exceeds 2 MB');
      console.log('     Consider aggressive code splitting and lazy loading');
    }
    
    if (largeJsFiles.length === 0 && largeCssFiles.length === 0 && totalSize <= SIZE_LIMITS.total) {
      console.log('  ✓ Bundle size is within recommended limits');
      console.log('  ✓ All chunks are appropriately sized');
    }

    // Print chunk analysis
    console.log('\n📦 Chunk Analysis:');
    console.log('='.repeat(70));
    const vendorChunks = filesByType.js.filter((f) => f.name.includes('vendor'));
    const appChunks = filesByType.js.filter((f) => !f.name.includes('vendor') && !f.name.includes('index'));
    
    console.log(`  Vendor chunks: ${vendorChunks.length} (${formatBytes(vendorChunks.reduce((sum, f) => sum + f.size, 0))})`);
    console.log(`  App chunks:    ${appChunks.length} (${formatBytes(appChunks.reduce((sum, f) => sum + f.size, 0))})`);
    
    console.log('\n✓ Analysis complete!\n');

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run analysis
analyzeBundle();
