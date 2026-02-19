import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';
import auth from '@react-native-firebase/auth';
import { getNotificationPreferences, saveNotificationPreferences } from '../../services/firestore';

type Props = NativeStackScreenProps<RootStackParamList, "NotificationSettings">;

export default function NotificationSettingsPage({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [healthChanges, setHealthChanges] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [relationshipRequests, setRelationshipRequests] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const result = await getNotificationPreferences(currentUser.uid);
      if (result.success && result.data) {
        setEmergencyAlerts(result.data.emergencyAlerts);
        setHealthChanges(result.data.healthChanges);
        setChatMessages(result.data.chatMessages);
        setRelationshipRequests(result.data.relationshipRequests);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const result = await saveNotificationPreferences({
        userId: currentUser.uid,
        emergencyAlerts,
        healthChanges,
        chatMessages,
        relationshipRequests,
      });

      if (result.success) {
        Alert.alert('Success', 'Notification preferences saved!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
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
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled?: boolean
  ) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
        {disabled && (
          <Text style={styles.disabledText}>Cannot be disabled for safety</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#10b981' }}
        thumbColor="#fff"
        disabled={disabled}
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={styles.loadingText}>Loading preferences...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alert Notifications</Text>
              
              {renderToggleItem(
                'Emergency Alerts',
                'Get notified when an elder sends SOS',
                emergencyAlerts,
                (value) => handleToggle(setEmergencyAlerts, emergencyAlerts),
                true // Cannot disable
              )}
              
              {renderToggleItem(
                'Health Status Changes',
                'Notified when health risk changes',
                healthChanges,
                (value) => handleToggle(setHealthChanges, healthChanges)
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Communication</Text>
              
              {renderToggleItem(
                'Chat Messages',
                'Get notified for new messages',
                chatMessages,
                (value) => handleToggle(setChatMessages, chatMessages)
              )}
              
              {renderToggleItem(
                'Relationship Requests',
                'Notified for new caregiver requests',
                relationshipRequests,
                (value) => handleToggle(setRelationshipRequests, relationshipRequests)
              )}
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.infoText}>
                {saving ? 'Saving...' : 'Changes are saved automatically.'}
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
  disabledText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: '#f0fdf4',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  infoText: {
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
