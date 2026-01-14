// Debug script to better understand UID vs ID in ConvertKit
import { config } from 'dotenv';
config();

// Try both approaches to see what works
async function debugFormId() {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  
  if (!apiKey) {
    console.error('CONVERTKIT_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  try {
    // Get all forms first
    console.log('Fetching all ConvertKit forms...');
    const formsResponse = await fetch(`https://api.convertkit.com/v3/forms?api_key=${apiKey}`);
    
    if (!formsResponse.ok) {
      throw new Error(`API request failed with status ${formsResponse.status}`);
    }
    
    const formsData = await formsResponse.json();
    
    if (!formsData.forms || formsData.forms.length === 0) {
      console.log('No forms found in your ConvertKit account');
      return;
    }
    
    // Print details about the Clare form
    const clareForm = formsData.forms.find(form => form.name === 'Clare form');
    
    if (clareForm) {
      console.log('Found Clare form details:');
      console.log(`ID: ${clareForm.id}`);
      console.log(`Name: ${clareForm.name}`);
      console.log(`UID: ${clareForm.uid}`);
      
      console.log('\nNow trying to fetch form details using different IDs:');
      
      // Try with numeric ID
      try {
        console.log(`\nTesting fetch with numeric ID: ${clareForm.id}`);
        const numericResponse = await fetch(`https://api.convertkit.com/v3/forms/${clareForm.id}?api_key=${apiKey}`);
        console.log(`Status: ${numericResponse.status}`);
        
        if (numericResponse.ok) {
          const data = await numericResponse.json();
          console.log('Success! Form details retrieved using numeric ID');
        } else {
          console.log('Failed to fetch form using numeric ID');
        }
      } catch (err) {
        console.error('Error testing numeric ID:', err.message);
      }
      
      // Try with UID
      try {
        console.log(`\nTesting fetch with UID: ${clareForm.uid}`);
        const uidResponse = await fetch(`https://api.convertkit.com/v3/forms/${clareForm.uid}?api_key=${apiKey}`);
        console.log(`Status: ${uidResponse.status}`);
        
        if (uidResponse.ok) {
          const data = await uidResponse.json();
          console.log('Success! Form details retrieved using UID');
        } else {
          console.log('Failed to fetch form using UID');
        }
      } catch (err) {
        console.error('Error testing UID:', err.message);
      }
      
      // Try subscribe endpoint with numeric ID
      try {
        console.log(`\nTesting subscribe endpoint with numeric ID: ${clareForm.id}`);
        const testEmail = `test-numeric-${Date.now()}@example.com`;
        const subscribeNumericResponse = await fetch(`https://api.convertkit.com/v3/forms/${clareForm.id}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: apiKey,
            email: testEmail,
          }),
        });
        
        console.log(`Status: ${subscribeNumericResponse.status}`);
        
        if (subscribeNumericResponse.ok) {
          const data = await subscribeNumericResponse.json();
          console.log(`Success! Email ${testEmail} subscribed using numeric ID`);
          console.log(`Subscription ID: ${data.subscription?.id}`);
        } else {
          const errorText = await subscribeNumericResponse.text();
          console.log(`Failed to subscribe using numeric ID: ${errorText}`);
        }
      } catch (err) {
        console.error('Error testing subscribe with numeric ID:', err.message);
      }
      
      // Try subscribe endpoint with UID
      try {
        console.log(`\nTesting subscribe endpoint with UID: ${clareForm.uid}`);
        const testEmail = `test-uid-${Date.now()}@example.com`;
        const subscribeUidResponse = await fetch(`https://api.convertkit.com/v3/forms/${clareForm.uid}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: apiKey,
            email: testEmail,
          }),
        });
        
        console.log(`Status: ${subscribeUidResponse.status}`);
        
        if (subscribeUidResponse.ok) {
          const data = await subscribeUidResponse.json();
          console.log(`Success! Email ${testEmail} subscribed using UID`);
          console.log(`Subscription ID: ${data.subscription?.id}`);
        } else {
          const errorText = await subscribeUidResponse.text();
          console.log(`Failed to subscribe using UID: ${errorText}`);
        }
      } catch (err) {
        console.error('Error testing subscribe with UID:', err.message);
      }
    } else {
      console.log('Clare form not found in your ConvertKit account');
    }
  } catch (error) {
    console.error('Error debugging ConvertKit form ID:', error);
  }
}

debugFormId();