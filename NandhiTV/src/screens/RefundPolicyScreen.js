import React from 'react';
import LegalPage from './legal/LegalPage';

export default function RefundPolicyScreen() {
  return (
    <LegalPage
      icon="hand-coin-outline"
      title="Refund Policy"
      tagline="Donations to Nandhi Cultural & Charitable Foundation"
      lastUpdated="April 2026"
      sections={[
        {
          heading: '1. Voluntary Contributions',
          body:
            'All donations received through Nandhi TV are voluntary contributions to Nandhi Cultural & Charitable Foundation. Contributions are directed towards temple service (uzhavara pani), devotional content production, livestream infrastructure and the Foundation\'s charitable initiatives.',
        },
        {
          heading: '2. Non-Refundable by Default',
          body:
            'As donations are used in furtherance of our charitable and devotional objectives, contributions are generally non-refundable once successfully processed and acknowledged.',
        },
        {
          heading: '3. Exceptions — When You May Request a Refund',
          body: [
            'Duplicate payment: the same donation was charged more than once due to a technical error.',
            'Incorrect amount: an amount materially different from what you intended was charged because of an app or gateway issue.',
            'Unauthorised transaction: the payment was made without your knowledge or consent (please also notify your bank).',
            'Failed donation: your account was debited but no donation receipt was issued by the Foundation.',
          ],
        },
        {
          heading: '4. How to Request a Refund',
          body: [
            'Email us at nandhihari@nandhitv.com within 7 days of the transaction.',
            'Include the transaction reference or UTR, the registered mobile number, the date of payment and the reason for your request.',
            'Attach a screenshot of your bank / UPI statement where possible.',
          ],
        },
        {
          heading: '5. Review & Processing',
          body:
            'Each refund request is reviewed individually by the Foundation\'s finance team. We aim to respond within 7 business days. Approved refunds are processed back to the original payment method within 10–14 business days, depending on your bank or payment provider.',
        },
        {
          heading: '6. 80G Tax Receipts',
          body:
            'If an 80G receipt has already been issued for a refunded donation, the receipt will be marked cancelled and must not be used when filing taxes. A revised acknowledgement will be shared where applicable.',
        },
        {
          heading: '7. Payment Gateway Charges',
          body:
            'Refunds will cover the donation amount received by the Foundation. Any non-refundable charges levied by the payment gateway or bank will be deducted from the refunded amount.',
        },
        {
          heading: '8. Chargebacks',
          body:
            'We encourage you to contact us first before raising a chargeback with your bank. Unjustified chargebacks may delay resolution and can impact your future ability to donate through the app.',
        },
        {
          heading: '9. Changes to This Policy',
          body:
            'We may revise this Refund Policy from time to time. Any changes will be updated on this page with a new "Last updated" date. Continued use of the donation feature constitutes acceptance of the updated policy.',
        },
        {
          heading: '10. Contact',
          body:
            'For all refund or donation-related queries, please write to nandhihari@nandhitv.com. Our team will be glad to assist you.',
        },
      ]}
    />
  );
}
