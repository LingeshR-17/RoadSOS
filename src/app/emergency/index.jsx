import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

import ServiceCard from '../../components/emergency/ServiceCard';
import ContactsList from '../../components/emergency/ContactsList';

export default function VictimEmergencyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [countdown, setCountdown] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [isSafeState, setIsSafeState] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, countdown]);

  const handleTerminateSOS = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsSafeState(true);
    setCountdown(0);
  };

  const handleReturnHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#090b0e" />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleReturnHome} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS ACTIVE SIGNAL</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {!isSafeState && (
          <View style={styles.alertBanner}>
            <View style={styles.pulseDot} />
            <Text style={styles.alertText}>BROADCASTING DISTRESS SIGNAL TO ALL RELAYS</Text>
          </View>
        )}
        
        {/* Placeholder text info banner while timer HUD is unlinked */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>
            {isSafeState ? "STATUS: SECURED" : `AUTOMATED ROUTING ACTIVE: T-MINUS ${countdown}s`}
          </Text>
        </View>

        {/* 2. Service Cards */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Emergency Dispatch Channels</Text>
          <View style={{ marginBottom: 12 }}>
            <ServiceCard
              title="Police Responders"
              number="112"
              icon="🚨"
              description={isSafeState ? "Dispatch Cancelled" : "Satellite GPS telemetry relayed"}
              isBystanderMode={false}
              isSafeState={isSafeState}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <ServiceCard
              title="General Trauma Center"
              number="102"
              icon="🏥"
              description={isSafeState ? "Standby Cancelled" : "Medical dispatch authorized"}
              isBystanderMode={false}
              isSafeState={isSafeState}
            />
          </View>
        </View>

        {/* 3. Contacts Alert List */}
        <View style={styles.contactsSection}>
          <ContactsList isActiveEmergency={!isSafeState} isBystanderMode={false} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!isSafeState ? (
            <TouchableOpacity style={styles.safeButton} onPress={handleTerminateSOS} activeOpacity={0.85}>
              {/* 🛑 FIXED THE INVALID ICON NAME STRING HERE */}
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" style={styles.safeIcon} />
              <Text style={styles.safeButtonText}>I Am Safe · Terminate SOS</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.returnButton} onPress={handleReturnHome} activeOpacity={0.85}>
              <Ionicons name="home" size={20} color="#FFFFFF" style={styles.safeIcon} />
              <Text style={styles.safeButtonText}>Return to Map View</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b0e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 1.5 },
  placeholder: { width: 40 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(230, 57, 70, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(230, 57, 70, 0.25)', paddingVertical: 10, paddingHorizontal: 12, marginBottom: 16 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E63946', marginRight: 8 },
  alertText: { color: '#E63946', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  infoBanner: { padding: 24, backgroundColor: '#11141b', borderRadius: 16, borderOpacity: 0.1, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  infoBannerTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  servicesSection: { marginBottom: 20 },
  sectionTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800', letterSpacing: 0.8, marginBottom: 12 },
  contactsSection: { marginBottom: 24 },
  actionContainer: { marginTop: 10 },
  safeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 16 },
  returnButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', borderRadius: 16, paddingVertical: 16 },
  safeIcon: { marginRight: 8 },
  safeButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});