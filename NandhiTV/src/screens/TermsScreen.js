import React from 'react';
import LegalPage from './legal/LegalPage';

export default function TermsScreen() {
  return (
    <LegalPage
      icon="file-document-outline"
      title="Terms & Conditions"
      tagline="Terms governing the use of NANDHI TV services"
lastUpdated="08 May 2026"
description="Welcome to NANDHI TV, an internet television and digital media platform operated under Nandhi Cultural & Charitable Foundation, Chennai, India. By accessing or using NANDHI TV’s website, mobile application, social media pages, programmes, or digital services, you agree to comply with the following Terms & Conditions."      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: [
            'By using NANDHI TV services, you confirm that you have read and understood these Terms & Conditions.',
            'You agree to abide by all applicable Indian laws and regulations.',
            'You will use the platform responsibly and ethically.',
            'If you do not agree with these terms, please discontinue use of the platform.',
          ],
        },
        {
          heading: '2. About NANDHI TV',
          body: [
            'NANDHI TV is a cultural, devotional, educational, awareness, and social service-oriented digital media platform.',
            'The platform features Carnatic music, cultural programmes, devotional content, awareness programmes, social service initiatives, interviews, talent promotion, NGO-related activities, environmental and community welfare projects.',
          ],
        },
        {
          heading: '3. User Eligibility',
          body: [
            'Users accessing NANDHI TV services must be legally capable of entering into agreements under Indian law.',
            'Users must provide accurate information where registration is required.',
            'The platform must only be used for lawful purposes.',
          ],
        },
        {
          heading: '4. Intellectual Property Rights',
          body:
            'All content published on NANDHI TV including videos, logos, programme titles, graphics, audio, articles, posters, photographs, and website/app content are the intellectual property of NANDHI TV or respective content owners. Unauthorized copying, reproduction, downloading, redistribution, or commercial use is strictly prohibited without written permission.',
        },
        {
          heading: '5. User Conduct',
          body: [
            'Users shall not upload unlawful, abusive, defamatory, or obscene content.',
            'Users shall not violate copyright or intellectual property rights.',
            'Users shall not attempt unauthorized access to systems or data.',
            'Users shall not spread false information or harmful content.',
            'Users shall not misuse comment sections or communication features.',
            'NANDHI TV reserves the right to remove objectionable content or restrict access without prior notice.',
          ],
        },
        {
          heading: '6. User Submissions',
          body: [
            'Any videos, photos, articles, talent profiles, or other materials voluntarily submitted to NANDHI TV must belong to the user or be legally authorized for submission.',
            'Submitted materials may be used by NANDHI TV for promotional, cultural, educational, or broadcasting purposes unless otherwise agreed.',
            'Users remain responsible for the legality of submitted content.',
          ],
        },
        {
          heading: '7. Third-Party Services',
          body:
            'NANDHI TV may provide links to YouTube, social media platforms, payment gateways, and external websites. NANDHI TV is not responsible for the content, policies, or services of third-party platforms.',
        },
        {
          heading: '8. Donations & Payments',
          body: [
            'Where donations, subscriptions, sponsorships, or service payments are accepted, payments must be lawful and authorized.',
            'Refunds, if applicable, shall be subject to NANDHI TV policies.',
            'NANDHI TV reserves the right to reject or cancel transactions where necessary.',
          ],
        },
        {
          heading: '9. Disclaimer',
          body: [
            'NANDHI TV makes reasonable efforts to provide accurate and meaningful content.',
            'Content is provided on an "as available" basis.',
            'We do not guarantee uninterrupted or error-free services.',
            'Opinions expressed by guests, artists, or participants are their own.',
            'NANDHI TV shall not be liable for indirect or consequential damages arising from platform usage.',
          ],
        },
        {
          heading: '10. Privacy',
          body:
            'Use of NANDHI TV services is also governed by our Privacy Policy.',
        },
        {
          heading: '11. Suspension or Termination',
          body: [
            'NANDHI TV reserves the right to suspend access, remove content, or terminate accounts or participation for violations of these Terms & Conditions or applicable laws.',
          ],
        },
        {
          heading: '12. Governing Law & Jurisdiction',
          body:
            'These Terms & Conditions shall be governed by the laws of India. Any disputes shall fall under the jurisdiction of courts located in Chennai, Tamil Nadu.',
        },
        {
          heading: '13. Changes to Terms',
          body:
            'NANDHI TV may revise these Terms & Conditions at any time. Updated versions will be published on official platforms.',
        },
        {
  heading: '14. Contact Information',
  body:
    'NANDHI TV\n' +
    'Under: Nandhi Cultural & Charitable Foundation\n' +
    'No. 4, 2/2, Vembuliamman Koil Street\n' +
    'K.K. Nagar West\n' +
    'Chennai – 600078, Tamil Nadu, India\n\n' +
    'Website: www.nandhi.co.in\n' +
    'Email: info@nandhi.co.in\n' +
    'Phone: +91 94440 92722',
},
      ]}
    />
  );
}
