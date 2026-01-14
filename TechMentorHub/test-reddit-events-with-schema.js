// A more sophisticated test script for Reddit events that uses the schema validation

import fetch from 'node-fetch';

// Define your tracking pixel ID
const pixelId = 'a2_gtxp2aek62bn';

// Function to generate a test conversion that will pass schema validation
function createValidConversion(type) {
  return {
    conversionType: type,
    email: 'test@example.com',
    planName: 'Test Plan',
    planPrice: 9999, // in cents = $99.99
    sessionId: `session_${Date.now()}`,
    path: '/test-path',
    referrer: 'test-script',
    // Don't include createdAt or id as they're auto-generated
  };
}

async function testRedditEvents() {
  console.log('Testing Reddit events with schema validation...\n');
  
  try {
    // First test the API endpoint (server-side)
    console.log('1. Testing Reddit Conversions API (server-side)...');
    const apiResponse = await fetch('http://localhost:5000/api/test/reddit');
    const apiData = await apiResponse.json();
    
    console.log(`API test status: ${apiData.success ? 'SUCCESS' : 'FAILED'}`);
    if (apiData.success) {
      console.log(`Tested ${Object.keys(apiData.results).length} event types`);
      
      // Check which events succeeded
      const successfulEvents = Object.entries(apiData.results)
        .filter(([, result]) => result.success)
        .map(([type]) => type);
      
      console.log(`Successfully sent events: ${successfulEvents.join(', ')}`);
    } else {
      console.error('API test failed:', apiData.message);
    }
    
    // Then test each conversion type through the analytics API
    console.log('\n2. Testing conversions via analytics API...');
    
    // Test conversion types
    const conversionTypes = [
      'qualification',
      'try_demo',
      'signup',
      'call_booking',
      'checkout_completed',
      'quiz_completion'
    ];
    
    // Test each conversion type
    for (const type of conversionTypes) {
      console.log(`Triggering ${type} conversion event`);
      
      // Create a valid conversion object for this type
      const conversion = createValidConversion(type);
      
      // Send the conversion to the API
      const response = await fetch('http://localhost:5000/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversion)
      });
      
      // Get the response data
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Failed to parse response' };
      }
      
      // Log the result
      if (response.ok) {
        console.log(`  - ${type} status: SUCCESS`);
      } else {
        console.log(`  - ${type} status: FAILED (${response.status})`);
        console.log(`    Error: ${JSON.stringify(responseData)}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\nTest complete. Check your Reddit dashboard to verify events were recorded.');
    console.log('Note: It may take a few minutes for events to appear in the dashboard.');
    
  } catch (error) {
    console.error('Error testing Reddit events:', error);
  }
}

// Run the tests
testRedditEvents();