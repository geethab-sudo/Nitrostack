/**
 * Test script for book_insurance_with_user tool
 * 
 * Run with: node test-booking-tool.js
 */

import { InsuranceTools } from './dist/modules/insurance/insurance.tools.js';

// Mock ExecutionContext
const mockContext = {
  logger: {
    info: (...args) => console.log('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args),
  }
};

async function testBookingTool() {
  try {
    console.log('🧪 Testing book_insurance_with_user tool...\n');
    
    const tools = new InsuranceTools();
    
    // Test data
    const testInput = {
      policyNumber: 'POL-HDFC-HEA-0001',
      email: 'testuser@example.com',
      name: 'Test User',
      phoneNumber: '+91-9876543210',
      paymentMethod: 'credit_card',
      startDate: '2024-01-01',
      years: 1,
      notes: 'Test booking'
    };
    
    console.log('📝 Test Input:');
    console.log(JSON.stringify(testInput, null, 2));
    console.log('\n');
    
    console.log('⏳ Executing book_insurance_with_user...\n');
    
    const result = await tools.bookInsuranceWithUser(testInput, mockContext);
    
    console.log('✅ Success! Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n');
    
    console.log('📊 Summary:');
    console.log(`- Booking ID: ${result.booking._id}`);
    console.log(`- User ID: ${result.user._id}`);
    console.log(`- Policy Number: ${result.booking.policyNumber}`);
    console.log(`- Premium: ₹${result.booking.premium?.toLocaleString('en-IN')}`);
    console.log(`- Coverage: ₹${result.booking.coverageAmount?.toLocaleString('en-IN')}`);
    console.log(`- Status: ${result.booking.status}`);
    console.log(`- Payment Status: ${result.booking.paymentStatus}`);
    console.log(`- Is New User: ${result.isNewUser}`);
    
  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testBookingTool()
  .then(() => {
    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
