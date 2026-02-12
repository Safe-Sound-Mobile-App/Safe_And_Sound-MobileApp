import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';
import Constants from 'expo-constants';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, "About">;

const logoImage = require('../../../assets/logo/safe_and_sound_logo.png');

export default function AboutPage({ navigation }: Props) {
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleOpenTerms = () => {
    // TODO: Replace with actual terms URL
    Linking.openURL('https://safeandsound.com/terms');
  };

  const handleOpenPrivacyPolicy = () => {
    // TODO: Replace with actual privacy policy URL
    Linking.openURL('https://safeandsound.com/privacy');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action cannot be undone. All your data including:\n\n• Profile information\n• Relationships with caregivers/elders\n• Chat history\n• Health data\n\nwill be permanently deleted.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'Type your email to confirm account deletion',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement actual account deletion in Phase 7
            Alert.alert('Coming Soon', 'Account deletion will be implemented in Phase 7');
          },
        },
      ]
    );
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    showChevron: boolean = true
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuContent}>
        <Ionicons name={icon as any} size={20} color="#6b7280" style={styles.menuIcon} />
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#d1d5db" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={caregiverSettingStyles.container}>
      <GradientHeader title="Safe & Sound" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>Safe & Sound</Text>
          <Text style={styles.appTagline}>Caring for those who cared for us</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version {appVersion}</Text>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          {renderMenuItem(
            'document-text',
            'Terms of Service',
            'Read our terms and conditions',
            handleOpenTerms
          )}
          
          {renderMenuItem(
            'shield-checkmark',
            'Privacy Policy',
            'How we protect your data',
            handleOpenPrivacyPolicy
          )}
          
          {renderMenuItem(
            'code-working',
            'Open Source Licenses',
            'Third-party software licenses',
            () => Alert.alert('Coming Soon', 'Licenses page coming soon!')
          )}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          {renderMenuItem(
            'information-circle',
            'App Version',
            appVersion,
            () => {},
            false
          )}
          
          {renderMenuItem(
            'people',
            'Development Team',
            'SKE19 - Kasetsart University',
            () => {},
            false
          )}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.dangerWarning}>
            ⚠️ This action cannot be undone. All your data will be permanently deleted.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for elders and their caregivers
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 Safe & Sound. All rights reserved.
          </Text>
        </View>
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
  appInfoSection: {
    alignItems: 'center' as const,
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  versionBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
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
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#ef4444',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ef4444',
    marginLeft: 8,
  },
  dangerWarning: {
    fontSize: 13,
    color: '#dc2626',
    textAlign: 'center' as const,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#9ca3af',
  },
};
