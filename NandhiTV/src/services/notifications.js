import { Platform } from 'react-native';
import { Notifications } from './api';

// Firebase Cloud Messaging is optional. Install @react-native-firebase/app
// and @react-native-firebase/messaging to enable push tokens. Until then,
// we just register the device with a null fcm_token so the backend knows
// about the device for in-app announcements.

let DeviceInfo = null;
try {
  DeviceInfo = require('react-native-device-info');
} catch (e) {
  DeviceInfo = null;
}

export async function registerDevice() {
  let device_id = 'unknown-device';
  try {
    if (DeviceInfo && DeviceInfo.getUniqueId) {
      device_id = await DeviceInfo.getUniqueId();
    }
  } catch (e) {
    // ignore
  }

  try {
    await Notifications.register({
      device_id,
      fcm_token: null,
      platform: Platform.OS,
    });
  } catch (e) {
    // backend not reachable yet — that's fine, app still works
  }
}
