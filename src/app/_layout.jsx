import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider, useUserStore } from '../store/userStore';
import { LocationProvider } from '../store/locationStore';

function RootLayoutNav() {
  const { userToken, isOnboarded, isLoading } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const isOnboardingRoute = segments[1] === 'onboarding';

    if (!userToken) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (!isOnboarded) {
      if (!isOnboardingRoute) router.replace('/(auth)/onboarding');
    } else {
      if (inAuthGroup) router.replace('/(tabs)');
    }
  }, [userToken, isOnboarded, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090b0e' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#090b0e' }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="emergency/index" />
        <Stack.Screen name="bystander/index" />
        <Stack.Screen name="bystander/on-scene-toolkit" />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="map/hospital" />
      </Stack>
    </View>
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
