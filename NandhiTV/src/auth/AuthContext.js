import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { Auth, setAuthToken, loadStoredToken, persistToken } from '../services/api';

/**
 * Auth states:
 *   loading  → checking AsyncStorage at startup
 *   signedIn → has valid backend JWT + user object
 *   guest    → explicitly tapped "Skip for now"
 *   signedOut→ no token, no guest flag (show Login)
 */
const GUEST_FLAG_KEY = '@nandhi_tv/is_guest';

const AuthContext = createContext({
  status: 'loading',          // 'loading' | 'signedIn' | 'guest' | 'signedOut'
  user: null,                 // { id, phone, name, email, profile_complete, ... }
  isLoggedIn: false,
  isGuest: false,
  // Firebase OTP
  sendOtp:     async (_phone) => {},    // returns confirmation object
  verifyOtp:   async (_confirmation, _code) => {}, // confirms OTP → signs in
  // Profile
  updateProfile: async (_payload) => {},
  // Session
  signInAsGuest: () => {},
  signOut:       async () => {},
  refreshUser:   async () => {},
});

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  // On mount: try to restore an existing session
  useEffect(() => {
    (async () => {
      try {
        const [token, guestFlag] = await Promise.all([
          loadStoredToken(),
          AsyncStorage.getItem(GUEST_FLAG_KEY),
        ]);

        if (token) {
           setAuthToken(token); 
          // Try to refresh user from /me
          try {
            const u = await Auth.me();
            setUser(u);
            setStatus('signedIn');
            return;
          } catch (e) {
            // Token expired/invalid → fall through to signed out
            await persistToken(null);
          }
        }

        if (guestFlag === '1') {
          setStatus('guest');
        } else {
          setStatus('signedOut');
        }
      } catch (e) {
        setStatus('signedOut');
      }
    })();
  }, []);

  // --- Firebase Phone OTP ---
  const sendOtp = useCallback(async (phoneE164) => {
    // phoneE164 example: '+919876543210'
    const confirmation = await auth().signInWithPhoneNumber(phoneE164);
    return confirmation; // must be passed back to verifyOtp
  }, []);

  const verifyOtp = useCallback(async (confirmation, code) => {
    // Confirms the code → Firebase signs the user in on-device
    const credential = await confirmation.confirm(code);
    const idToken    = await credential.user.getIdToken();
 // 🔥 ADD THIS LINE
  console.log("ID TOKEN:", idToken);
    // Exchange Firebase ID token → our backend JWT
    const { token, user: userFromApi } = await Auth.verifyOtp(idToken);
    await persistToken(token);
    setAuthToken(token);
    setUser(userFromApi);
    await AsyncStorage.removeItem(GUEST_FLAG_KEY);
    setStatus('signedIn');
    return userFromApi;
  }, []);

  // --- Profile ---
  const updateProfile = useCallback(async (payload) => {
    const updated = await Auth.profile(payload);
    setUser(updated);
    return updated;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await Auth.me();
      setUser(u);
    } catch (e) { /* ignore */ }
  }, []);

  // --- Session ---
  const signInAsGuest = useCallback(async () => {
    await AsyncStorage.setItem(GUEST_FLAG_KEY, '1');
    setStatus('guest');
  }, []);

  const signOut = useCallback(async () => {
    try { await auth().signOut(); } catch (e) { /* ignore */ }
    await persistToken(null);
    setAuthToken(null);
    await AsyncStorage.removeItem(GUEST_FLAG_KEY);
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = {
    status,
    user,
    isLoggedIn: status === 'signedIn',
    isGuest:    status === 'guest',
    sendOtp,
    verifyOtp,
    updateProfile,
    signInAsGuest,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
