import React from 'react';
import LegalPage from './legal/LegalPage';

export default function PrivacyPolicyScreen() {
  return (
    <LegalPage
      icon="shield-lock-outline"
      title="Privacy Policy"
      tagline="How NANDHI TV protects and handles your information"
      lastUpdated="08 May 2026"
      description="Welcome to NANDHI TV, a digital media and internet television platform operated by Nandhi Cultural & Charitable Foundation, Chennai, India. We value the privacy of our viewers, subscribers, volunteers, artists, members, and website/app users. This Privacy Policy explains how we collect, use, store, and protect your information in accordance with applicable Indian laws, including the Information Technology Act, 2000 and relevant data protection guidelines."
      sections={[
        {
          heading: '1. Information We Collect',
          body: [
            'Personal Information',
            'Name',
            'Mobile number',
            'Email address',
            'City / State',
            'Address (if voluntarily provided)',
            'Profile photographs or media submissions',
            'Payment or donation details (where applicable)',
            'Technical Information',
            'Device information',
            'IP address',
            'Browser type',
            'App usage statistics',
            'Cookies and analytics data',
            'User Submitted Content',
            'Videos',
            'Photos',
            'Comments',
            'Talent registration details',
            'Volunteer or freelancer applications',
          ],
        },
        {
          heading: '2. Purpose of Collecting Information',
          body: [
            'Providing access to NANDHI TV services',
            'Subscriber management',
            'Artist and volunteer registrations',
            'Event updates and announcements',
            'Cultural and devotional programme communication',
            'Improving website/app performance',
            'Customer support',
            'Legal compliance',
            'Sending notifications related to programmes, awareness activities, social initiatives, and media content',
          ],
        },
        {
          heading: '3. Data Protection',
          body: [
            'NANDHI TV takes reasonable security measures to protect user information from unauthorized access, misuse, loss, disclosure, and alteration.',
            'However, while we strive to protect your information, no online platform can guarantee 100% security.',
          ],
        },
        {
          heading: '4. Sharing of Information',
          body: [
            'We do not sell or rent personal information to third parties.',
            'Information may be shared only when required by Indian law.',
            'For government or legal compliance.',
            'With trusted technical service providers supporting our operations.',
            'With user consent.',
          ],
        },
        {
          heading: '5. Cookies & Analytics',
          body: [
            'Our website or app may use cookies and analytics tools to improve user experience.',
            'Understand audience preferences.',
            'Monitor platform performance.',
            'Users may disable cookies through browser settings if preferred.',
          ],
        },
        {
          heading: '6. Children’s Privacy',
          body:
            'NANDHI TV does not knowingly collect personal information from children without parental or guardian consent where required.',
        },
        {
          heading: '7. Third-Party Links',
          body:
            'Our platform may contain links to third-party websites, social media pages, YouTube channels, or payment gateways. NANDHI TV is not responsible for the privacy practices of such external platforms.',
        },
        {
          heading: '8. User Rights',
          body: [
            'Users may request correction of personal information.',
            'Request deletion of voluntarily submitted information.',
            'Opt out of promotional communication.',
            'Requests may be sent to the contact details below.',
          ],
        },
        {
          heading: '9. Intellectual Property',
          body:
            'Videos, logos, programme content, graphics, articles, and media published on NANDHI TV are the intellectual property of NANDHI TV or respective content owners and shall not be copied or reproduced without permission.',
        },
        {
          heading: '10. Policy Updates',
          body:
            'NANDHI TV reserves the right to modify or update this Privacy Policy at any time. Updated versions will be published on the official platform.',
        },
        {
          heading: '11. Contact Information',
          body: [
            'NANDHI TV',
            'Under: Nandhi Cultural & Charitable Foundation',
            'No. 4, 2/2, Vembuliamman Koil Street',
            'K.K. Nagar West',
            'Chennai – 600078, Tamil Nadu, India',
            'Website: www.nandhi.co.in',
            'Email: info@nandhi.co.in',
            'Phone: +91 94440 92722',
          ],
        },
        {
          heading: 'Agreement',
          body:
            'By using NANDHI TV website, app, or media services, users agree to this Privacy Policy.',
        },
      ]}
    />
  );
}