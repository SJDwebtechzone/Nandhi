import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import LiveScreen from '../screens/LiveScreen';
import VideosScreen from '../screens/VideosScreen';
import EventsScreen from '../screens/EventsScreen';
import DonateScreen from '../screens/DonateScreen';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

const Tabs = createBottomTabNavigator();

/**
 * Circular avatar button rendered in the top-right of the orange
 * navigation header. Shows the user's initial when signed in, otherwise
 * a generic account icon. Taps go to the Profile screen in the parent
 * stack (RootNavigator).
 */
function HeaderAvatarButton({ navigation }) {
  const { colors } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const initial = (user?.name || user?.phone || '').trim().charAt(0).toUpperCase();

  const goToProfile = () => {
    // Profile lives in the parent stack, not in the tabs.
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate('Profile');
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <TouchableOpacity
      onPress={goToProfile}
      activeOpacity={0.8}
      style={[
        styles.avatarBtn,
        { backgroundColor: colors.white, borderColor: colors.goldLight },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {isLoggedIn && initial ? (
        <Text style={[styles.avatarText, { color: colors.saffronDark }]}>
          {initial}
        </Text>
      ) : (
        <Icon name="account" size={20} color={colors.saffronDark} />
      )}
    </TouchableOpacity>
  );
}

export default function TabsNavigator() {
  const { colors } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: { backgroundColor: colors.saffron },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <HeaderAvatarButton navigation={navigation} />,
        tabBarActiveTintColor: colors.saffron,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home:   'home-variant',
            Live:   'broadcast',
            Videos: 'play-box-multiple',
            Events: 'calendar-star',
            Donate: 'heart',
          };
          return <Icon name={map[route.name]} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="Home"   component={HomeScreen}   options={{ title: 'Nandhi TV' }} />
      <Tabs.Screen name="Live"   component={LiveScreen}   options={{ title: 'Live' }} />
      <Tabs.Screen name="Videos" component={VideosScreen} options={{ title: 'Videos' }} />
      <Tabs.Screen name="Events" component={EventsScreen} options={{ title: 'Events' }} />
      <Tabs.Screen name="Donate" component={DonateScreen} options={{ title: 'Donate' }} />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
