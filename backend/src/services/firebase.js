const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let initialized = false;

function init() {
  if (initialized) return admin;
  try {
    let cred;

    // Option 1: inline JSON in env (preferred for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      cred = admin.credential.cert(json);
      console.log('[firebase] Loaded service account from FIREBASE_SERVICE_ACCOUNT_JSON');
      console.log('[firebase] Project ID:', json.project_id);
    } else {
      // Option 2: file path (works locally and on VPS)
      const filePath = path.resolve(
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
          path.join(__dirname, '..', '..', 'firebase-service-account.json')
      );
      if (fs.existsSync(filePath)) {
        try {
          // Use fs.readFileSync + JSON.parse (more robust than require() on
          // Windows paths with spaces, e.g. "D:\Client Projects\...").
          const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          cred = admin.credential.cert(json);
          console.log('[firebase] Loaded service account from:', filePath);
          console.log('[firebase] Project ID:', json.project_id);
        } catch (e) {
          console.error('[firebase] Failed to read/parse service account JSON at', filePath);
          console.error('[firebase] Error:', e.message);
        }
      } else {
        console.warn('[firebase] No service account found at', filePath);
        console.warn('[firebase] Phone authentication will not work until you add it.');
      }
    }

    if (cred) {
      admin.initializeApp({ credential: cred });
      initialized = true;
    }
  } catch (e) {
    console.error('[firebase] init failed:', e.message);
  }
  return admin;
}

async function verifyIdToken(idToken) {
  if (!initialized) init();
  return admin.auth().verifyIdToken(idToken);
}

async function sendNotification(token, payload) {
  if (!initialized) init();
  return admin.messaging().send({
    token,
    notification: payload.notification,
    data: payload.data || {},
  });
}

module.exports = { init, admin, verifyIdToken, sendNotification };
