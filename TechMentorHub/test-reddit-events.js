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
    
    // Then test each standard event type through client JS code
    console.log('\n2. Testing browser events (client-side)...');
    console.log('Triggering page view event');
    
    // Make a request to an endpoint that will trigger client-side events
    const testResponse = await fetch('http://localhost:5000/api/analytics/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversionType: 'qualification',
        planName: 'Test Plan',
        planPrice: 99.99,
        email: 'test@example.com',
        sessionId: `test_session_${Date.now()}`
      })
    });
    
    console.log(`Client-side test status: ${testResponse.ok ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('\nTest complete. Check your Reddit dashboard to verify events were recorded.');
    console.log('Note: It may take a few minutes for events to appear in the dashboard.');
    
  } catch (error) {
    console.error('Error testing Reddit events:', error);
  }
}

// Run the tests
testRedditEvents();