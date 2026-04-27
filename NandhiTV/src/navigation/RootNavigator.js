import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabsNavigator from './TabsNavigator';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import TempleListScreen from '../screens/TempleListScreen';
import TempleDetailScreen from '../screens/TempleDetailScreen';
import DevotionalScreen from '../screens/DevotionalScreen';
import MusicScreen from '../screens/MusicScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutScreen from '../screens/AboutScreen';
import NgoActivitiesScreen from '../screens/NgoActivitiesScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import RefundPolicyScreen from '../screens/RefundPolicyScreen';

import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

const Stack = createNativeStackNavigator();

function LoadingSplash({ colors }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.saffron} />
    </View>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();
  const { status, user, isLoggedIn, isGuest } = useAuth();

  // While we check AsyncStorage for an existing session
  if (status === 'loading') {
    return <LoadingSplash colors={colors} />;
  }

  // Not signed in and didn't tap "Skip" → force Login
  if (!isLoggedIn && !isGuest) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // Signed in but profile incomplete (first time) → Profile setup
  if (isLoggedIn && user && !user.profile_complete && !user.name) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
    );
  }

  // Main app stack (either signed in with profile, or guest)
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.saffron },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="VideoPlayer"    component={VideoPlayerScreen} options={{ title: 'Video' }} />
      <Stack.Screen name="Devotional"     component={DevotionalScreen}  options={{ title: 'Devotional' }} />
      <Stack.Screen name="Music"          component={MusicScreen}       options={{ title: 'Music' }} />
      <Stack.Screen name="TempleList"     component={TempleListScreen}  options={{ title: '108 Divya Desam' }} />
      <Stack.Screen name="TempleDetail"   component={TempleDetailScreen}options={{ title: 'Temple' }} />
      <Stack.Screen name="EventDetail"    component={EventDetailScreen} options={{ title: 'Event' }} />
      <Stack.Screen name="Notifications"  component={NotificationsScreen}options={{ title: 'Notifications' }} />
      <Stack.Screen name="About"          component={AboutScreen}       options={{ title: 'About Us' }} />
      <Stack.Screen name="NgoActivities"  component={NgoActivitiesScreen}options={{ title: 'Uzhavara Pani' }} />
      <Stack.Screen name="Profile"        component={ProfileScreen}      options={{ title: 'Profile' }} />
      {/* Reachable from profile menu if they want to complete it later */}
      <Stack.Screen name="ProfileSetup"   component={ProfileSetupScreen} options={{ title: 'Edit Profile' }} />

      {/* Legal / policy screens */}
      <Stack.Screen name="PrivacyPolicy"  component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="Terms"          component={TermsScreen}         options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="RefundPolicy"   component={RefundPolicyScreen}  options={{ title: 'Refund Policy' }} />
    </Stack.Navigator>
  );
}
