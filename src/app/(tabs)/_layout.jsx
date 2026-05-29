import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

/**
 * TabsLayout
 * 
 * Production tab navigator with 4 high-contrast bottom tabs:
 *  1. index  → "Map"       (root map layer screen with floating SOS)
 *  2. responder → "Open Jobs" (for professional responders / drivers)
 *  3. chat   → "AI Chat"   (chatbot + push-to-talk voice assistant)
 *  4. profile → "Profile"  (user profile, documents, logout)
 */
export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
            ...SHADOWS.lg,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="responder"
          options={{
            title: 'Responder',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'AI Chat',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
        {/* Hide the old map tab from the tab bar — it's been promoted to index */}
        <Tabs.Screen
          name="map"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
