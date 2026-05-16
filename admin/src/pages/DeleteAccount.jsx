import React from 'react';

const DeleteAccount = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">
        Account Deletion Request
      </h1>

      <p className="mb-4">
        Users of NANDHI TV may request deletion of their account and associated
        personal data by contacting us through the email below.
      </p>

      <p className="mb-4">
        Please send your deletion request from your registered mobile number or
        registered email address.
      </p>

      <p className="mb-4">
        Email: info@nandhi.co.in
      </p>

      <p className="mb-4">
        Upon verification, account-related personal data will be deleted within
        a reasonable period, except where retention is required for legal or
        security purposes.
      </p>

      <p>
        Certain transactional or legal records may be retained as required under
        applicable laws.
      </p>
    </div>
  );
};

export default DeleteAccount;