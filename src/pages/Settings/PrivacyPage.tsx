import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';
import auth from '@react-native-firebase/auth';
import { getPrivacyPreferences, savePrivacyPreferences } from '../../services/firestore';

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

export default function PrivacyPage({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [healthDataSharing, setHealthDataSharing] = useState(true);
  const [shareHeartRate, setShareHeartRate] = useState(true);
  const [shareSpO2, setShareSpO2] = useState(true);
  const [shareFallDetection, setShareFallDetection] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const result = await getPrivacyPreferences(currentUser.uid);
      if (result.success && result.data) {
        setLocationSharing(result.data.locationSharing);
        setHealthDataSharing(result.data.healthDataSharing);
        setShareHeartRate(result.data.shareHeartRate);
        setShareSpO2(result.data.shareSpO2);
        setShareFallDetection(result.data.shareFallDetection);
      }
    } catch (error) {
      console.error('Error loading privacy preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const result = await savePrivacyPreferences({
        userId: currentUser.uid,
        locationSharing,
        healthDataSharing,
        shareHeartRate,
        shareSpO2,
        shareFallDetection,
      });

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to save privacy preferences');
      }
    } catch (error) {
      console.error('Error saving privacy preferences:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    setter: (value: boolean) => void,
    currentValue: boolean
  ) => {
    setter(!currentValue);
    // Auto-save after toggle
    setTimeout(() => handleSavePreferences(), 500);
  };

  const renderToggleItem = (
    icon: string,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    indent?: boolean
  ) => (
    <View style={[styles.toggleItem, indent && styles.toggleItemIndent]}>
      <View style={styles.toggleContent}>
        <Ionicons name={icon as any} size={20} color="#6b7280" style={styles.toggleIcon} />
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#10b981' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <SafeAreaView style={caregiverSettingStyles.container}>
      <GradientHeader title="Safe & Sound" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={styles.loadingText}>Loading privacy settings...</Text>
          </View>
        ) : (
          <>
            {/* Location Sharing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              {renderToggleItem(
                'location',
                'Real-time Location Sharing',
                'Share your current location with caregivers',
                locationSharing,
                (value) => handleToggle(setLocationSharing, locationSharing)
              )}
            </View>

            {/* Health Data Sharing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Data</Text>
              
              {renderToggleItem(
                'fitness',
                'Health Data Sharing',
                'Share health metrics with caregivers',
                healthDataSharing,
                (value) => handleToggle(setHealthDataSharing, healthDataSharing)
              )}

              {healthDataSharing && (
                <>
                  {renderToggleItem(
                    'heart',
                    'Heart Rate',
                    'Share heart rate measurements',
                    shareHeartRate,
                    (value) => handleToggle(setShareHeartRate, shareHeartRate),
                    true
                  )}
                  
                  {renderToggleItem(
                    'water',
                    'Blood Oxygen (SpO2)',
                    'Share oxygen saturation levels',
                    shareSpO2,
                    (value) => handleToggle(setShareSpO2, shareSpO2),
                    true
                  )}
                  
                  {renderToggleItem(
                    'warning',
                    'Fall Detection',
                    'Share fall detection alerts',
                    shareFallDetection,
                    (value) => handleToggle(setShareFallDetection, shareFallDetection),
                    true
                  )}
                </>
              )}
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={styles.warningText}>
                {saving ? 'Saving...' : 'Your privacy settings are saved and applied across the app.'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  toggleItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toggleItemIndent: {
    paddingLeft: 48,
    backgroundColor: '#f9fafb',
  },
  toggleContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  warningBox: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: '#f0fdf4',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#065f46',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
};
