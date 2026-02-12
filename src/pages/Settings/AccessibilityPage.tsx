import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';
import { useAccessibility } from '../../contexts/AccessibilityContext';

type Props = NativeStackScreenProps<RootStackParamList, "Accessibility">;

export default function AccessibilityPage({ navigation }: Props) {
  const { settings, updateTextSize, updateHighContrast, updateLanguage, loading } = useAccessibility();
  const [localTextSize, setLocalTextSize] = useState(settings.textSize);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalTextSize(settings.textSize);
  }, [settings.textSize]);

  const handleTextSizeChange = async (size: number) => {
    setLocalTextSize(size);
  };

  const handleTextSizeComplete = async (size: number) => {
    try {
      setSaving(true);
      await updateTextSize(size);
    } catch (error) {
      Alert.alert('Error', 'Failed to save text size');
    } finally {
      setSaving(false);
    }
  };

  const handleHighContrastToggle = async (value: boolean) => {
    try {
      setSaving(true);
      await updateHighContrast(value);
      Alert.alert('Success', value ? 'High contrast mode enabled' : 'High contrast mode disabled');
    } catch (error) {
      Alert.alert('Error', 'Failed to update high contrast mode');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (lang: 'th' | 'en') => {
    try {
      setSaving(true);
      await updateLanguage(lang);
      Alert.alert('Success', `Language changed to ${lang === 'th' ? 'Thai' : 'English'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to change language');
    } finally {
      setSaving(false);
    }
  };

  const getTextSizeLabel = () => {
    if (localTextSize <= 14) return 'Small';
    if (localTextSize <= 16) return 'Medium';
    if (localTextSize <= 18) return 'Large';
    return 'Extra Large';
  };

  return (
    <SafeAreaView style={caregiverSettingStyles.container}>
      <GradientHeader title="Safe & Sound" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        ) : (
          <>
            {/* Text Size */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Text Size</Text>
              
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>Font Size</Text>
                  <Text style={styles.sliderValue}>{getTextSizeLabel()} ({Math.round(localTextSize)}px)</Text>
                </View>
                
                <Slider
                  style={styles.slider}
                  minimumValue={12}
                  maximumValue={24}
                  value={localTextSize}
                  onValueChange={handleTextSizeChange}
                  onSlidingComplete={handleTextSizeComplete}
                  minimumTrackTintColor="#00a896"
                  maximumTrackTintColor="#9ca3af"
                  thumbTintColor="#008080"
                  step={2}
                />
                
                <View style={styles.previewBox}>
                  <Text style={[styles.previewText, { fontSize: localTextSize }]}>
                    Preview: This is how text will look in the app
                  </Text>
                </View>
              </View>
            </View>

            {/* High Contrast */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Display</Text>
              
              <View style={styles.toggleItem}>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitle}>High Contrast Mode</Text>
                  <Text style={styles.toggleSubtitle}>
                    Increase color contrast for better visibility
                  </Text>
                </View>
                <Switch
                  value={settings.highContrast}
                  onValueChange={handleHighContrastToggle}
                  trackColor={{ false: '#d1d5db', true: '#10b981' }}
                  thumbColor="#fff"
                  disabled={saving}
                />
              </View>
            </View>

            {/* Language */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Language</Text>
              
              <TouchableOpacity
                style={[styles.languageOption, settings.language === 'th' && styles.languageSelected]}
                onPress={() => handleLanguageChange('th')}
                disabled={saving}
              >
                <Text style={[styles.languageText, settings.language === 'th' && styles.languageTextSelected]}>
                  🇹🇭 ไทย (Thai)
                </Text>
                {settings.language === 'th' && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.languageOption, settings.language === 'en' && styles.languageSelected]}
                onPress={() => handleLanguageChange('en')}
                disabled={saving}
              >
                <Text style={[styles.languageText, settings.language === 'en' && styles.languageTextSelected]}>
                  🇬🇧 English
                </Text>
                {settings.language === 'en' && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.infoText}>
                {saving ? 'Saving...' : 'Settings saved locally and applied across the app.'}
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
  sliderContainer: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sliderHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#008080',
  },
  slider: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  previewBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  previewText: {
    color: '#1f2937',
    lineHeight: 24,
  },
  toggleItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  languageOption: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  languageSelected: {
    backgroundColor: '#f0fdf4',
  },
  languageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  languageTextSelected: {
    fontWeight: '600' as const,
    color: '#10b981',
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
