// Quick test script to verify APIs are working
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testAPIs() {
  console.log('🧪 Testing Omni Folio Guard APIs...\n');

  // Test health endpoint
  try {
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test portfolio endpoint with a sample address
  try {
    console.log('\n2. Testing Portfolio API...');
    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik's address
    const portfolioResponse = await fetch(`${BASE_URL}/api/portfolio/${testAddress}`);
    const portfolioData = await portfolioResponse.json();
    
    if (portfolioData.success) {
      console.log('✅ Portfolio API working');
      console.log(`   - Total Value: $${portfolioData.data.totalValue.toFixed(2)}`);
      console.log(`   - Tokens: ${portfolioData.data.tokens.length}`);
      console.log(`   - 24h Change: ${portfolioData.data.change24hPercent.toFixed(2)}%`);
    } else {
      console.log('❌ Portfolio API failed:', portfolioData.error);
    }
  } catch (error) {
    console.log('❌ Portfolio API failed:', error.message);
  }

  // Test DeFi opportunities endpoint
  try {
    console.log('\n3. Testing DeFi Opportunities API...');
    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const defiResponse = await fetch(`${BASE_URL}/api/defi/opportunities/${testAddress}`);
    const defiData = await defiResponse.json();
    
    if (defiData.success) {
      console.log('✅ DeFi Opportunities API working');
      console.log(`   - Opportunities: ${defiData.data.length}`);
      if (defiData.data.length > 0) {
        console.log(`   - Top APY: ${defiData.data[0].apy.toFixed(2)}% (${defiData.data[0].name})`);
      }
    } else {
      console.log('❌ DeFi Opportunities API failed:', defiData.error);
    }
  } catch (error) {
    console.log('❌ DeFi Opportunities API failed:', error.message);
  }

  // Test security endpoint
  try {
    console.log('\n4. Testing Security API...');
    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const securityResponse = await fetch(`${BASE_URL}/api/security/${testAddress}`);
    const securityData = await securityResponse.json();
    
    if (securityData.success) {
      console.log('✅ Security API working');
      console.log(`   - Security Score: ${securityData.data.securityScore}/100`);
      console.log(`   - Approvals: ${securityData.data.approvals.length}`);
      console.log(`   - Security Checks: ${securityData.data.securityChecks.length}`);
    } else {
      console.log('❌ Security API failed:', securityData.error);
    }
  } catch (error) {
    console.log('❌ Security API failed:', error.message);
  }

  console.log('\n🎉 API testing complete!');
  console.log('\nTo start the full application:');
  console.log('1. Run: npm run dev:full');
  console.log('2. Open: http://localhost:5173');
  console.log('3. Connect your wallet and explore!');
}

// Run the tests
testAPIs().catch(console.error);
