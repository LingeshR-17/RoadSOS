import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider, useUserStore } from '../store/userStore';
import { LocationProvider } from '../store/locationStore';
import { COLORS } from '../constants/theme';

function RootLayoutNav() {
  const { userToken, isOnboarded, isLoading } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for the store session checks to finish
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isOnboardingRoute = segments[1] === 'onboarding';

    if (!userToken) {
      // If there is no token, force the user to sign in
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!isOnboarded) {
      // If user is authenticated but not onboarded, redirect to onboarding screen
      if (!isOnboardingRoute) {
        router.replace('/(auth)/onboarding');
      }
    } else {
      // If user is logged in & onboarded, prevent accessing auth pages (redirect to Home)
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [userToken, isOnboarded, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8FAFC' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="map/hospital" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <LocationProvider>
        <RootLayoutNav />
      </LocationProvider>
    </UserProvider>
  );
}
