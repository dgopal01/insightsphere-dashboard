#!/usr/bin/env node

/**
 * Test Production Build Script
 * Tests the production build locally before deployment
 * Requirements: 12.5
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');
const PORT = 4173;

/**
 * Run a command and return a promise
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${command} ${args.join(' ')}\n`);
    
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main test function
 */
async function testBuild() {
  try {
    console.log('📦 Testing Production Build\n');
    console.log('=' .repeat(50));

    // Step 1: Check if dist directory exists
    console.log('\n✓ Step 1: Checking for build artifacts...');
    if (!existsSync(DIST_DIR)) {
      console.log('❌ Build directory not found. Running build first...\n');
      await runCommand('npm', ['run', 'build:prod']);
    } else {
      console.log('✓ Build directory found');
    }

    // Step 2: Run type checking
    console.log('\n✓ Step 2: Running type check...');
    await runCommand('npm', ['run', 'type-check']);
    console.log('✓ Type check passed');

    // Step 3: Run linting
    console.log('\n✓ Step 3: Running linter...');
    await runCommand('npm', ['run', 'lint']);
    console.log('✓ Linting passed');

    // Step 4: Start preview server
    console.log('\n✓ Step 4: Starting preview server...');
    console.log(`\n🌐 Preview server will start at http://localhost:${PORT}`);
    console.log('\n📝 Manual Testing Checklist:');
    console.log('   1. Verify authentication flow works');
    console.log('   2. Check all routes load correctly');
    console.log('   3. Test chat logs review functionality');
    console.log('   4. Test feedback logs review functionality');
    console.log('   5. Verify dashboard metrics display');
    console.log('   6. Check responsive design on different screen sizes');
    console.log('   7. Test error handling scenarios');
    console.log('   8. Verify performance (load times, interactions)');
    console.log('\n💡 Press Ctrl+C to stop the preview server\n');

    await runCommand('npm', ['run', 'preview']);

  } catch (error) {
    console.error('\n❌ Build test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testBuild();
