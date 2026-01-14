// Test the waitlist API endpoint
// This script submits a test email to the waitlist endpoint

const testEmail = `test${Date.now()}@example.com`;

async function testWaitlistAPI() {
  console.log(`Testing waitlist API with email: ${testEmail}`);
  
  try {
    const response = await fetch('http://localhost:5000/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        firstName: 'Test User',
        quiz_result: 'ready',
        source: 'api_test'
      }),
    });
    
    const data = await response.json();
    
    console.log('Response from waitlist API:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Successfully added to local waitlist');
      
      if (data.convertKit && data.convertKit.attempted) {
        console.log(`✅ Attempted to add to ConvertKit form ${data.convertKit.formId}`);
      } else {
        console.log('❌ ConvertKit integration not attempted');
      }
    } else {
      console.log('❌ Failed to add to waitlist');
    }
  } catch (error) {
    console.error('Error testing waitlist API:', error);
  }
}

testWaitlistAPI();