// Simple test to check if the issue is with Next.js itself
console.log('Testing basic Node.js functionality...');

// Test basic function calls
function testFunction() {
  return 'test';
}

console.log('Basic function test:', testFunction());

// Test if there are any issues with the current directory
console.log('Current directory:', process.cwd());

// Test if we can require basic modules
try {
  const path = require('path');
  console.log('Path module loaded successfully');
} catch (error) {
  console.error('Error loading path module:', error);
}

console.log('Test completed successfully');
