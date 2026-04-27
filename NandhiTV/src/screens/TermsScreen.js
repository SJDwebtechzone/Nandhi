import React from 'react';
import LegalPage from './legal/LegalPage';

export default function TermsScreen() {
  return (
    <LegalPage
      icon="file-document-outline"
      title="Terms & Conditions"
      tagline="The rules of using Nandhi TV"
      lastUpdated="April 2026"
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body:
            'By downloading, installing or using the Nandhi TV mobile application ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Service. The Service is offered by Nandhi Cultural & Charitable Foundation.',
        },
        {
          heading: '2. Eligibility',
          body:
            'You must be at least 13 years of age to use the Service. By using Nandhi TV you confirm that you meet this requirement and that the information you provide is accurate and up to date.',
        },
        {
          heading: '3. Account & Security',
          body: [
            'You are responsible for maintaining the confidentiality of your phone-number verification and device.',
            'You agree to notify us immediately if you suspect unauthorised access to your account.',
            'We may suspend or terminate accounts that violate these Terms or applicable law.',
          ],
        },
        {
          heading: '4. Content',
          body:
            'All videos, images, text, logos, and design elements made available through Nandhi TV are owned by the Foundation or its content partners and are protected under copyright law. You may view and share content for personal, non-commercial devotional use only. You may not download, modify, redistribute or monetise any content without written permission.',
        },
        {
          heading: '5. User Conduct',
          body: [
            'Do not use the Service for any unlawful, fraudulent or abusive activity.',
            'Do not attempt to reverse-engineer, decompile or interfere with the Service.',
            'Do not upload or transmit harmful code, malware or spam.',
            'Respect the devotional nature of the platform and other devotees.',
          ],
        },
        {
          heading: '6. Donations',
          body:
            'Donations made through the Service are voluntary contributions to Nandhi Cultural & Charitable Foundation. Please review our Refund Policy for the conditions under which donations may be refunded. The Foundation may issue 80G tax receipts where eligible under applicable Indian tax laws.',
        },
        {
          heading: '7. Third-Party Services',
          body:
            'The Service may include links or integrations with third-party platforms such as YouTube (for streaming) and payment gateways. Your interaction with those platforms is governed by their own terms and policies. We are not responsible for third-party content or services.',
        },
        {
          heading: '8. Disclaimers',
          body:
            'The Service is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted availability of livestreams, notifications or temple-event updates. Devotional content is shared for spiritual purposes and not as professional, medical or legal advice.',
        },
        {
          heading: '9. Limitation of Liability',
          body:
            'To the maximum extent permitted by law, the Foundation, its volunteers and partners shall not be liable for any indirect, incidental or consequential damages arising from your use of the Service.',
        },
        {
          heading: '10. Changes to the Service or Terms',
          body:
            'We may update, modify or discontinue parts of the Service at any time. Changes to these Terms will be announced within the app. Continued use of the Service after the update constitutes acceptance of the revised Terms.',
        },
        {
          heading: '11. Governing Law',
          body:
            'These Terms are governed by the laws of India. Any disputes arising out of or in connection with the Service shall be subject to the exclusive jurisdiction of the competent courts at Chennai, Tamil Nadu.',
        },
        {
          heading: '12. Contact',
          body:
            'For any questions about these Terms, please contact support@nandhitv.com.',
        },
      ]}
    />
  );
}
