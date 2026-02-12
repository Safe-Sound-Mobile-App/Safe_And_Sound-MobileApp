import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';

type Props = NativeStackScreenProps<RootStackParamList, "Accessibility">;

export default function AccessibilityPage({ navigation }: Props) {
  const [textSize, setTextSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState('th');

  const getTextSizeLabel = () => {
    if (textSize <= 14) return 'Small';
    if (textSize <= 16) return 'Medium';
    if (textSize <= 18) return 'Large';
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
        {/* Text Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Size</Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Font Size</Text>
              <Text style={styles.sliderValue}>{getTextSizeLabel()} ({Math.round(textSize)}px)</Text>
            </View>
            
            <Slider
              style={styles.slider}
              minimumValue={12}
              maximumValue={24}
              value={textSize}
              onValueChange={setTextSize}
              minimumTrackTintColor="#008080"
              maximumTrackTintColor="#d1d5db"
              thumbTintColor="#008080"
              step={2}
            />
            
            <View style={styles.previewBox}>
              <Text style={[styles.previewText, { fontSize: textSize }]}>
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
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          
          <TouchableOpacity
            style={[styles.languageOption, language === 'th' && styles.languageSelected]}
            onPress={() => setLanguage('th')}
          >
            <Text style={[styles.languageText, language === 'th' && styles.languageTextSelected]}>
              🇹🇭 ไทย (Thai)
            </Text>
            {language === 'th' && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageOption, language === 'en' && styles.languageSelected]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.languageText, language === 'en' && styles.languageTextSelected]}>
              🇬🇧 English
            </Text>
            {language === 'en' && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Settings will be saved locally. Full functionality coming in Phase 4.
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
  sliderContainer: {
    padding: 16,
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
    height: 40,
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
