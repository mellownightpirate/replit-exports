import React from 'react';
import { Link } from 'wouter';

export default function TermsOfService() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-[#06D6A0] hover:text-[#04b384] mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">Welcome to NextChapter. These Terms of Service ("Terms") govern your access to and use of our website, products, and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our services.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Eligibility</h2>
          <p className="mb-4">You must be at least 18 years old to use our services. By agreeing to these Terms, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into a binding agreement.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Account Registration</h2>
          <p className="mb-4">To access certain features of our services, you may need to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
          <p className="mb-4">You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Services and Payments</h2>
          <p className="mb-4">We provide various services related to tech mentoring and career development. The specific services available to you will depend on the package or plan you choose.</p>
          <p className="mb-4">By purchasing our services, you agree to pay all fees and charges associated with your account based on our current pricing. All payments are processed through secure third-party payment processors. We do not store your payment information on our servers.</p>
          <p className="mb-4">We offer a 14-day money-back guarantee for our services. If you are not satisfied with our services within the first 14 days after purchase, you may request a full refund by contacting us.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. "Until You're Hired" Guarantee</h2>
          <p className="mb-4">Our "Until You're Hired" guarantee allows clients to stay in the program until they land a job. This guarantee is subject to the following conditions:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You must actively participate in the program</li>
            <li>You must complete all assigned tasks and exercises</li>
            <li>You must attend all scheduled sessions</li>
            <li>You must apply to a reasonable number of job opportunities as advised by your mentor</li>
            <li>The guarantee is valid for up to 12 months from the date of purchase</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p className="mb-4">All content, features, and functionality of our services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of NextChapter or its licensors and are protected by copyright, trademark, and other intellectual property laws.</p>
          <p className="mb-4">You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website, except as follows:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials</li>
            <li>You may store files that are automatically cached by your web browser for display enhancement purposes</li>
            <li>You may print or download one copy of a reasonable number of pages of the website for your own personal, non-commercial use and not for further reproduction, publication, or distribution</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. User Content</h2>
          <p className="mb-4">Our services may allow you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material. You retain all rights in, and are solely responsible for, the content you post.</p>
          <p className="mb-4">By posting content, you grant us a non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, store, display, reproduce, modify, adapt, edit, publish, and distribute such content for the purpose of providing and promoting our services.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Prohibited Uses</h2>
          <p className="mb-4">You agree not to use our services:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation</li>
            <li>To impersonate or attempt to impersonate NextChapter, a NextChapter employee, another user, or any other person or entity</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of our services, or which, as determined by us, may harm NextChapter or users of our services or expose them to liability</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Termination</h2>
          <p className="mb-4">We reserve the right to terminate or suspend your account and access to our services, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach these Terms.</p>
          <p className="mb-4">Upon termination, your right to use our services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Disclaimer of Warranties</h2>
          <p className="mb-4">Our services are provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p className="mb-4">We do not guarantee that our services will meet your requirements, be uninterrupted, timely, secure, or error-free, or that the results that may be obtained from the use of our services will be accurate or reliable.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">11. Limitation of Liability</h2>
          <p className="mb-4">In no event shall NextChapter, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your access to or use of or inability to access or use our services</li>
            <li>Any conduct or content of any third party on our services</li>
            <li>Any content obtained from our services</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
          <p className="mb-4">We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice before any new terms take effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p className="mb-4">By continuing to access or use our services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use our services.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">13. Governing Law</h2>
          <p className="mb-4">These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">14. Contact Us</h2>
          <p className="mb-4">If you have any questions about these Terms, please contact us at:</p>
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