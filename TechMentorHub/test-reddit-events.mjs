// Test script to generate all types of Reddit events for testing

import fetch from 'node-fetch';

// Define your tracking pixel ID
const pixelId = 'a2_gtxp2aek62bn';

// Define all the event types to test
const eventTypes = [
  'PageVisit',
  'Lead',
  'Purchase',
  'Custom:qualification_check',
  'Custom:try_demo',
  'Lead:signup'
];

async function testRedditEvents() {
  console.log('Testing Reddit events...\n');
  
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
    
    // Array of conversion types to test with valid data
    const conversions = [
      {
        type: 'qualification',
        data: {
          conversionType: 'qualification',
          planName: 'Test Plan',
          planPrice: 99.99,
          email: 'test@example.com',
          sessionId: `test_session_${Date.now()}`,
          path: '/test-page',
          timestamp: new Date().toISOString(),
          referrer: 'test-script',
          completed: true
        }
      },
      {
        type: 'try_demo',
        data: {
          conversionType: 'try_demo',
          planName: 'Test Plan',
          planPrice: 99.99,
          email: 'test@example.com',
          sessionId: `test_session_${Date.now()}`,
          path: '/test-page',
          timestamp: new Date().toISOString(),
          referrer: 'test-script',
          completed: true
        }
      },
      {
        type: 'signup',
        data: {
          conversionType: 'signup',
          planName: 'Test Plan',
          planPrice: 99.99,
          email: 'test@example.com',
          sessionId: `test_session_${Date.now()}`,
          path: '/test-page',
          timestamp: new Date().toISOString(),
          referrer: 'test-script',
          completed: true
        }
      },
      {
        type: 'call_booking',
        data: {
          conversionType: 'call_booking',
          planName: 'Test Plan',
          planPrice: 99.99,
          email: 'test@example.com',
          sessionId: `test_session_${Date.now()}`,
          path: '/test-page',
          timestamp: new Date().toISOString(),
          referrer: 'test-script',
          completed: true
        }
      },
      {
        type: 'checkout_completed',
        data: {
          conversionType: 'checkout_completed',
          planName: 'Test Plan',
          planPrice: 99.99,
          email: 'test@example.com',
          sessionId: `test_session_${Date.now()}`,
          path: '/test-page',
          timestamp: new Date().toISOString(),
          referrer: 'test-script',
          completed: true
        }
      }
    ];
    
    for (const conversion of conversions) {
      console.log(`Triggering ${conversion.type} conversion event`);
      
      // Make a request to trigger this conversion type
      const testResponse = await fetch('http://localhost:5000/api/analytics/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conversion.data)
      });
      
      console.log(`  - ${conversion.type} status: ${testResponse.ok ? 'SUCCESS' : 'FAILED'}`);
      
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