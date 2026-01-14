import React from 'react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-[#06D6A0] hover:text-[#04b384] mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">Welcome to NextChapter ("we," "our," or "us"). We are committed to protecting your privacy and providing you with a safe and secure experience when using our services.</p>
          <p className="mb-4">This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">Personal Information</h3>
          <p className="mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Register for our services</li>
            <li>Fill out a form on our website</li>
            <li>Sign up for our newsletter</li>
            <li>Contact us</li>
            <li>Participate in our quizzes or assessments</li>
            <li>Make a purchase</li>
          </ul>
          <p className="mb-4">This information may include your name, email address, phone number, billing information, and other information you choose to provide.</p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">Automatically Collected Information</h3>
          <p className="mb-4">When you access our website, we may automatically collect certain information about your device and your interaction with our website. This information may include:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Operating system</li>
            <li>Device information</li>
            <li>Pages visited</li>
            <li>Time and date of your visit</li>
            <li>Referring website</li>
            <li>Mouse movements and clicks</li>
            <li>Time spent on pages</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We may use the information we collect for various purposes, including to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative information</li>
            <li>Send marketing communications</li>
            <li>Respond to inquiries and provide customer support</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Protect against, identify, and prevent fraud and other illegal activity</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
          <p className="mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Service providers who perform services on our behalf</li>
            <li>Partners with whom we offer co-branded services or products</li>
            <li>Legal and regulatory authorities, as required by applicable laws</li>
            <li>Third parties in connection with a business transfer</li>
          </ul>
          <p className="mb-4">We use industry-standard security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
          <p className="mb-4">We use cookies, web beacons, and similar tracking technologies to collect information about your browsing activities. These technologies help us analyze website traffic, personalize content, and measure the effectiveness of our marketing campaigns.</p>
          <p className="mb-4">You can set your browser to refuse all or some browser cookies or to alert you when cookies are being sent. If you disable or refuse cookies, please note that some parts of our website may become inaccessible or not function properly.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Third-Party Analytics</h2>
          <p className="mb-4">We use third-party analytics services, such as Google Analytics, Facebook Pixel, and Google Ads, to collect and analyze information about how users interact with our website. These services may use cookies and similar technologies to collect information about your use of our website and other websites.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights and Choices</h2>
          <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Accessing, correcting, or deleting your personal information</li>
            <li>Objecting to or restricting the processing of your personal information</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
          </ul>
          <p className="mb-4">To exercise these rights, please contact us using the information provided in the "Contact Us" section below.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
          <p className="mb-4">Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information from our files as soon as possible.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
          <p className="mb-4">We may update this Privacy Policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
          <p className="mb-4">If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:</p>
          <p className="mb-4">
            Email: support@nextchapter.codes<br />
            Address: 123 Tech Avenue, London, UK
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} NextChapter. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}