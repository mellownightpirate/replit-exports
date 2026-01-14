import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface ConvertKitFormProps {
  formId: string; 
  buttonText?: string;
  buttonClass?: string;
  source?: string;
}

/**
 * Component that renders a button to open a ConvertKit form modal
 * Uses ConvertKit's official JavaScript snippet
 */
export default function ConvertKitForm({ 
  formId,
  buttonText = "Join Waitlist",
  buttonClass = "px-6 py-3 bg-[#06D6A0] hover:bg-[#05c090] rounded-full font-bold text-[#333333] transition-colors whitespace-nowrap",
  source = "default"
}: ConvertKitFormProps) {
  
  useEffect(() => {
    // Load the ConvertKit script if it's not already loaded
    if (!document.getElementById('convertkit-script')) {
      const script = document.createElement('script');
      script.id = 'convertkit-script';
      script.src = 'https://f.convertkit.com/ckjs/ck.5.js';
      script.async = true;
      document.body.appendChild(script);
      
      console.log('ConvertKit script loaded for form ID:', formId);
    }
    
    return () => {
      // Cleanup function - note that we don't remove the script
      // as other instances might be using it
    };
  }, [formId]);
  
  // Track when the button is clicked
  const handleClick = () => {
    trackEvent('click', 'form', 'open_convertkit_modal', source);
    console.log('Opening ConvertKit modal for form ID:', formId);
  };
  
  return (
    <a 
      data-formkit-toggle={formId} 
      href={`https://nextchapter.ck.page/${formId}`}
      onClick={handleClick}
      className={buttonClass}
    >
      {buttonText}
    </a>
  );
}