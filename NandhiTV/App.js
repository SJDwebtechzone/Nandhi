import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/auth/AuthContext';
import { registerDevice } from './src/services/notifications';

function ThemedApp() {
  const { colors, isDark } = useTheme();
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card:       colors.card,
      text:       colors.text,
      border:     colors.border,
      primary:    colors.saffron,
      notification: colors.liveRed,
    },
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.statusBar}
        barStyle={colors.statusBarStyle || (isDark ? 'light-content' : 'dark-content')}
      />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  useEffect(() => {
    registerDevice().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider initialMode="system">
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
