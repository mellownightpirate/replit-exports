// Test script that submits to the waitlist API using a unique test email

const testEmail = `test-uid-${Date.now()}@example.com`;

async function testWaitlistWithFormUID() {
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
        source: 'api_test_with_uid'
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

testWaitlistWithFormUID();