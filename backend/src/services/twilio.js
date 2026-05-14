// Thin wrapper around Twilio Verify (https://www.twilio.com/docs/verify/api).
// Twilio Verify handles code generation, expiry, attempt limits, and SMS delivery.
//
// Required env vars (see backend/.env):
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_VERIFY_SERVICE_SID
//
// While the Twilio account is in TRIAL mode you can only send SMS to phone
// numbers that you've explicitly verified in the Twilio console at
//   https://console.twilio.com/us1/develop/phone-numbers/manage/verified
// Messages will be prefixed with "Sent from your Twilio trial account".
// Upgrade the account in Twilio to remove both restrictions.

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const verifySid  = process.env.TWILIO_VERIFY_SERVICE_SID;

let client = null;
if (accountSid && authToken && verifySid) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('[twilio] Missing TWILIO_* env vars - OTP routes will return 500');
}

function ensureConfigured() {
  if (!client || !verifySid) {
    const err = new Error('Twilio is not configured on the server');
    err.status = 500;
    throw err;
  }
}

// Send an SMS OTP to a phone number in E.164 format (e.g. "+919876543210").
async function sendOtp(phoneE164) {
  ensureConfigured();
  return client.verify.v2
    .services(verifySid)
    .verifications
    .create({ to: phoneE164, channel: 'sms' });
}

// Check a user-entered code against the latest Verification for this phone.
// Returns the Twilio VerificationCheck object; status === 'approved' on success.
async function checkOtp(phoneE164, code) {
  ensureConfigured();
  return client.verify.v2
    .services(verifySid)
    .verificationChecks
    .create({ to: phoneE164, code });
}

module.exports = { sendOtp, checkOtp };
