/**
 * API Smoke Test Suite for WorkSync Backend
 * Validates core public and protected endpoints for all 4 roles
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081/api/v1';

const testAccounts = [
  { role: 'superadmin', email: 'superadmin@example.com', password: 'Password@123' },
  { role: 'admin', email: 'admin@example.com', password: 'Password@123' },
  { role: 'manager', email: 'manager@example.com', password: 'Password@123' },
  { role: 'employee', email: 'employee@example.com', password: 'Password@123' }
];

async function runSmokeTests() {
  console.log(`Starting WorkSync API Smoke Test suite at: ${BASE_URL}\n`);
  let passed = 0;
  let failed = 0;

  // 1. Health check
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.status === 200) {
      console.log(' [PASS] Health check endpoint responded with 200 OK');
      passed++;
    } else {
      console.error(` [FAIL] Health check returned status ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error(` [FAIL] Health check failed: ${err.message}`);
    failed++;
  }

  // 2. Auth tests for all 4 roles
  for (const acc of testAccounts) {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: acc.email,
        password: acc.password
      });

      if (res.status === 200 && res.data?.token) {
        console.log(` [PASS] Login successful for role: ${acc.role}`);
        passed++;
      } else {
        console.error(` [FAIL] Login returned unexpected response for role: ${acc.role}`);
        failed++;
      }
    } catch (err) {
      console.error(` [FAIL] Login failed for ${acc.role}: ${err.response?.data?.message || err.message}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Smoke Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  return failed === 0;
}

if (require.main === module) {
  runSmokeTests()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

module.exports = { runSmokeTests };
