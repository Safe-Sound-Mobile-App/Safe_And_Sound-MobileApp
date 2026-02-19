import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';

type Props = NativeStackScreenProps<RootStackParamList, "HelpSupport">;

export default function HelpSupportPage({ navigation }: Props) {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@safeandsound.com?subject=Support Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+66812345678');
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    iconColor: string = '#6b7280'
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  const renderFAQItem = (question: string, answer: string) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>Q: {question}</Text>
      <Text style={styles.faqAnswer}>A: {answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={caregiverSettingStyles.container}>
      <GradientHeader title="Safe & Sound" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          {renderMenuItem(
            'mail',
            'Email Support',
            'support@safeandsound.com',
            handleEmailSupport,
            '#3b82f6'
          )}
          
          {renderMenuItem(
            'call',
            'Call Support',
            '+66 81-234-5678',
            handleCallSupport,
            '#10b981'
          )}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {renderFAQItem(
            'How do I add a caregiver/elder?',
            'Go to Settings > Account Manage to add or remove relationships.'
          )}
          
          {renderFAQItem(
            'How do I send an emergency alert?',
            'Press the red SOS button on your home page. Your caregivers will be notified immediately.'
          )}
          
          {renderFAQItem(
            'Can I control what data is shared?',
            'Yes! Go to Settings > Privacy to manage location and health data sharing.'
          )}
          
          {renderFAQItem(
            'How do I change notification settings?',
            'Go to Settings > Notification to customize your alert preferences.'
          )}
        </View>

        {/* How to Use */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          
          {renderMenuItem(
            'book',
            'User Guide',
            'Learn how to use the app',
            () => alert('User guide coming soon!'),
            '#f59e0b'
          )}
          
          {renderMenuItem(
            'play-circle',
            'Video Tutorials',
            'Watch step-by-step videos',
            () => alert('Video tutorials coming soon!'),
            '#ef4444'
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Need more help? Our support team is available 24/7 to assist you.
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
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: '#eff6ff',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 12,
  },
};
