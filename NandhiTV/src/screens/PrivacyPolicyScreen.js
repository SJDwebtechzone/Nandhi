import React from 'react';
import LegalPage from './legal/LegalPage';

export default function PrivacyPolicyScreen() {
  return (
    <LegalPage
      icon="shield-lock-outline"
      title="Privacy Policy"
      tagline="How Nandhi TV handles your information"
      lastUpdated="April 2026"
      sections={[
        {
          heading: '1. Introduction',
          body:
            'Nandhi Cultural & Charitable Foundation ("we", "us", "our") operates the Nandhi TV mobile application and related services (the "Service"). We are committed to protecting your privacy and handling your personal information responsibly. This policy explains what we collect, why we collect it, and how we use and safeguard it.',
        },
        {
          heading: '2. Information We Collect',
          body: [
            'Account information: name, mobile number, email address and city, provided during sign-up or profile setup.',
            'Authentication data: a secure session token tied to your device after phone-number verification.',
            'Donation information: amount, date, payment reference, and receipt details (processed by our payment partner).',
            'Usage information: videos watched, sections visited, device model and operating system, used to improve the app.',
            'Notifications: device push tokens (optional) used to deliver event and darshan alerts.',
          ],
        },
        {
          heading: '3. How We Use Your Information',
          body: [
            'Create and maintain your account and personalise your experience.',
            'Issue donation acknowledgements and, where applicable, 80G tax receipts.',
            'Send service-related notifications such as live aarti alerts, event reminders and announcements.',
            'Improve app reliability, content relevance and security.',
            'Comply with applicable legal and regulatory requirements.',
          ],
        },
        {
          heading: '4. Sharing & Disclosure',
          body:
            'We do not sell your personal information. We share it only with trusted partners who help us run the Service — for example, payment gateways for donations, cloud hosting providers, and analytics tools — and only to the extent necessary. We may disclose information if required by law or to protect the rights and safety of our users and the Foundation.',
        },
        {
          heading: '5. Data Retention',
          body:
            'We retain account and donation information for as long as your account is active and for the period required under applicable tax and accounting laws. You can request deletion of your account from the Profile screen at any time.',
        },
        {
          heading: '6. Security',
          body:
            'We use industry-standard safeguards including encrypted connections (HTTPS), secure token-based authentication and restricted server access. No system is perfectly secure, but we continually work to protect your information.',
        },
        {
          heading: '7. Your Rights',
          body: [
            'Access and review the personal information stored in your profile.',
            'Update or correct your profile details at any time.',
            'Request deletion of your account and associated personal data.',
            'Opt out of non-essential notifications from device settings.',
          ],
        },
        {
          heading: '8. Children',
          body:
            'Nandhi TV is a cultural & heritage platform intended for general audiences. We do not knowingly collect personal information from children under 13. If you believe a child has provided us information, please contact us and we will remove it.',
        },
        {
          heading: '9. Changes to This Policy',
          body:
            'We may update this Privacy Policy from time to time. Material changes will be announced within the app. Your continued use of the Service after the changes take effect constitutes acceptance of the updated policy.',
        },
        {
          heading: '10. Contact Us',
          body:
            'For any privacy-related questions or requests, write to us at nandhihari@nandhitv.com.',
        },
      ]}
    />
  );
}
