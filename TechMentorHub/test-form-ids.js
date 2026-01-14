// Simple script to fetch and display all form IDs from ConvertKit
import { config } from 'dotenv';
config();

async function listConvertKitForms() {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  
  if (!apiKey) {
    console.error('CONVERTKIT_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  try {
    console.log('Fetching ConvertKit forms...');
    const response = await fetch(`https://api.convertkit.com/v3/forms?api_key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.forms || data.forms.length === 0) {
      console.log('No forms found in your ConvertKit account');
      return;
    }
    
    console.log('\n===== Available ConvertKit Forms =====');
    console.log(`Found ${data.forms.length} form(s):\n`);
    
    data.forms.forEach(form => {
      console.log(`Form ID: ${form.id}`);
      console.log(`Name: ${form.name}`);
      console.log(`URL: ${form.url}`);
      console.log(`Created: ${new Date(form.created_at).toLocaleString()}`);
      console.log('----------------------------------------\n');
    });
    
    console.log('To use a form, update your .env file with:');
    console.log(`CONVERTKIT_FORM_ID=${data.forms[0].id}`);
    
  } catch (error) {
    console.error('Error fetching ConvertKit forms:', error);
  }
}

listConvertKitForms();