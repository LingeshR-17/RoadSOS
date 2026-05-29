import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProfileHeader from '../../components/profile/ProfileHeader';
import MedicalInfoCard from '../../components/profile/MedicalInfoCard';
import EmergencyContactList from '../../components/profile/EmergencyContactList';
import { useUserStore } from '../../store/userStore';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    profile, 
    medicalInfo, 
    emergencyContacts, 
    addEmergencyContact, 
    updateProfile, 
    updateMedicalInfo,
    logout,
  } = useUserStore();
  
  // Modal State for adding new emergency contact
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Modal State for editing profile/medical info
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editConditions, setEditConditions] = useState('');
  const [editInsurance, setEditInsurance] = useState('');

  const handleSettingsNavigation = () => {
    router.push('/settings');
  };

  const handleAddContactSubmit = async () => {
    if (!newName || !newRelationship || !newPhone) {
      Alert.alert("Incomplete Fields", "Please enter a name, relationship, and phone number.");
      return;
    }
    
    try {
      await addEmergencyContact({
        name: newName,
        relationship: newRelationship,
        phone: newPhone
      });

      setNewName('');
      setNewRelationship('');
      setNewPhone('');
      setContactModalVisible(false);
      Alert.alert("Contact Added", `${newName} has been added to your Emergency Contacts.`);
    } catch (err) {
      Alert.alert("Error", "Failed to add emergency contact. Please try again.");
    }
  };

  const openProfileEdit = () => {
    setEditName(profile.name);
    setEditCity(profile.city);
    setEditBloodGroup(medicalInfo.bloodGroup);
    setEditAllergies(medicalInfo.allergies);
    setEditConditions(medicalInfo.conditions);
    setEditInsurance(medicalInfo.insurance);
    setProfileModalVisible(true);
  };

  const handleProfileUpdateSubmit = async () => {
    if (!editName.trim() || !editCity.trim() || !editBloodGroup.trim()) {
      Alert.alert("Incomplete Fields", "Name, City, and Blood Group are required.");
      return;
    }

    try {
      await updateProfile({
        name: editName.trim(),
        city: editCity.trim()
      });

      await updateMedicalInfo({
        bloodGroup: editBloodGroup.trim(),
        allergies: editAllergies.trim(),
        conditions: editConditions.trim(),
        insurance: editInsurance.trim()
      });

      setProfileModalVisible(false);
      Alert.alert("Success", "Profile details updated successfully.");
    } catch (err) {
      Alert.alert("Error", "Failed to sync updates with server.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ProfileHeader 
          profile={profile} 
          onSettingsPress={handleSettingsNavigation} 
        />

        {/* Medical Information */}
        <MedicalInfoCard medicalInfo={medicalInfo} />

        {/* Profile Edit Action Button */}
        <TouchableOpacity 
          style={styles.editProfileBtn} 
          onPress={openProfileEdit}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={16} color={COLORS.secondary} style={styles.editIcon} />
          <Text style={styles.editProfileBtnText}>Edit Profile & Medical Details</Text>
        </TouchableOpacity>

        {/* Emergency Contacts */}
        <EmergencyContactList 
          contacts={emergencyContacts} 
          onAddPress={() => setContactModalVisible(true)} 
        />

        {/* ── DOCUMENT CARDS ── */}
        <View style={styles.docsSection}>
          <Text style={styles.docsSectionTitle}>IDENTITY DOCUMENTS</Text>
          
          <TouchableOpacity style={styles.docCard} activeOpacity={0.8}
            onPress={() => Alert.alert('Aadhaar Card', 'Link or upload your Aadhaar card for emergency identification.', [{ text: 'Upload', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }])}
          >
            <View style={[styles.docIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="id-card" size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Aadhaar Card</Text>
              <Text style={styles.docStatus}>Not linked</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.docCard} activeOpacity={0.8}
            onPress={() => Alert.alert('Driving License', 'Link your DL for quick accident reporting.', [{ text: 'Upload', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }])}
          >
            <View style={[styles.docIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="car" size={20} color={COLORS.warning} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Driving License</Text>
              <Text style={styles.docStatus}>Not linked</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.docCard} activeOpacity={0.8}
            onPress={() => Alert.alert('Insurance Policy', 'Link your motor insurance for instant claim dispatch.', [{ text: 'Upload', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }])}
          >
            <View style={[styles.docIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Insurance Policy</Text>
              <Text style={styles.docStatus}>Not linked</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── LOGOUT ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: () => {
                    if (logout) logout();
                    router.replace('/(auth)/login');
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        {/* Safety Spacer for custom bottom floating navigation bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal Popup to Edit Profile and Medical details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setProfileModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentWrapper}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={[styles.modalCard, styles.modalScrollWrapper]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                <Text style={styles.modalTitle}>Edit Profile Details</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>City / Location</Text>
                  <TextInput
                    style={styles.input}
                    value={editCity}
                    onChangeText={setEditCity}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Blood Group</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. B+"
                    value={editBloodGroup}
                    onChangeText={setEditBloodGroup}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Allergies</Text>
                  <TextInput
                    style={styles.input}
                    value={editAllergies}
                    onChangeText={setEditAllergies}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Medical Conditions</Text>
                  <TextInput
                    style={styles.input}
                    value={editConditions}
                    onChangeText={setEditConditions}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Insurance Provider</Text>
                  <TextInput
                    style={styles.input}
                    value={editInsurance}
                    onChangeText={setEditInsurance}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.modalBtnCancel]} 
                    onPress={() => setProfileModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.modalBtnAdd]} 
                    onPress={handleProfileUpdateSubmit}
                  >
                    <Text style={styles.addBtnText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Modal Popup to Add New Emergency Contact */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setContactModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentWrapper}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>New Emergency Contact</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={COLORS.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Relationship</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Father, Brother, Spouse"
                  placeholderTextColor={COLORS.textMuted}
                  value={newRelationship}
                  onChangeText={setNewRelationship}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 90000 00000"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  value={newPhone}
                  onChangeText={setNewPhone}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalBtnCancel]} 
                  onPress={() => setContactModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalBtnAdd]} 
                  onPress={handleAddContactSubmit}
                >
                  <Text style={styles.addBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bottomSpacer: {
    height: 110,
  },
  // Document Cards
  docsSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  docsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  docIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  docStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    height: 48,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(230, 57, 70, 0.15)',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    height: 44,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  editIcon: {
    marginRight: 6,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  modalScrollWrapper: {
    maxHeight: '90%',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: Platform.OS === 'ios' ? 20 : 5,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: COLORS.lightBg,
    marginRight: SPACING.sm,
  },
  modalBtnAdd: {
    backgroundColor: COLORS.primaryDark,
    marginLeft: SPACING.sm,
    ...SHADOWS.sm,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.card,
  },
});
