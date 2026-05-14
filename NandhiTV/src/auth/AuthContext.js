import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  // Twilio OTP (delivered by our backend)
  sendOtp:     async (_phoneE164) => {},
  verifyOtp:   async (_phoneE164, _code) => {},
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

  // --- Twilio Phone OTP (via our backend) ---
  // phoneE164 example: '+919876543210'
  const sendOtp = useCallback(async (phoneE164) => {
    await Auth.sendOtp(phoneE164);
    return phoneE164; // pass back to verifyOtp so the screen knows what to verify
  }, []);

  const verifyOtp = useCallback(async (phoneE164, code) => {
    const { token, user: userFromApi } = await Auth.verifyOtp(phoneE164, code);
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
