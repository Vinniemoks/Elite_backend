#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required dependencies and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  const result = condition();
  checks.push({ name, passed: result, message });
  if (result) {
    passed++;
    console.log(`✓ ${name}`);
  } else {
    failed++;
    console.log(`✗ ${name}: ${message}`);
  }
}

console.log('\n🔍 Verifying Elite Events Kenya Backend Setup...\n');

// Check Node.js version
check(
  'Node.js version',
  () => {
    const version = process.version.match(/^v(\d+)/)[1];
    return parseInt(version) >= 18;
  },
  'Node.js 18+ required'
);

// Check package.json
check(
  'package.json exists',
  () => fs.existsSync(path.join(__dirname, '../package.json')),
  'package.json not found'
);

// Check node_modules
check(
  'Dependencies installed',
  () => fs.existsSync(path.join(__dirname, '../node_modules')),
  'Run npm install'
);

// Check .env file
check(
  '.env file exists',
  () => fs.existsSync(path.join(__dirname, '../.env')),
  'Copy .env.example to .env and configure'
);

// Check Prisma schema
check(
  'Prisma schema exists',
  () => fs.existsSync(path.join(__dirname, '../prisma/schema.prisma')),
  'Prisma schema not found'
);

// Check src directory structure
const requiredDirs = [
  'src/config',
  'src/controllers',
  'src/middleware',
  'src/routes',
  'src/services',
  'src/utils',
  'src/socket'
];

requiredDirs.forEach(dir => {
  check(
    `${dir} directory`,
    () => fs.existsSync(path.join(__dirname, '..', dir)),
    `${dir} directory not found`
  );
});

// Check critical files
const criticalFiles = [
  'src/server.js',
  'src/config/database.js',
  'src/middleware/auth.js',
  'src/middleware/errorHandler.js'
];

criticalFiles.forEach(file => {
  check(
    file,
    () => fs.existsSync(path.join(__dirname, '..', file)),
    `${file} not found`
  );
});

// Check if .env has required variables
if (fs.existsSync(path.join(__dirname, '../.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT'
  ];

  requiredVars.forEach(varName => {
    check(
      `${varName} in .env`,
      () => envContent.includes(varName),
      `${varName} not configured in .env`
    );
  });
}

console.log('\n' + '='.repeat(50));
console.log(`\n✓ Passed: ${passed}`);
console.log(`✗ Failed: ${failed}`);
console.log('\n' + '='.repeat(50));

if (failed === 0) {
  console.log('\n✅ Setup verification complete! You\'re ready to start.\n');
  console.log('Next steps:');
  console.log('1. Start PostgreSQL and Redis (or run: docker-compose up -d)');
  console.log('2. Run migrations: npm run prisma:migrate');
  console.log('3. Seed database: npm run prisma:seed');
  console.log('4. Start server: npm run dev\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
