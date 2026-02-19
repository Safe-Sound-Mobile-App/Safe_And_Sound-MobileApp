import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';
import { useAccessibility } from '../../contexts/AccessibilityContext';

type Props = NativeStackScreenProps<RootStackParamList, "Accessibility">;

export default function AccessibilityPage({ navigation }: Props) {
  const { settings, updateTextSize, loading } = useAccessibility();
  const [localTextSize, setLocalTextSize] = useState(settings.textSize);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalTextSize(settings.textSize);
  }, [settings.textSize]);

  const handleTextSizeSelect = async (size: number) => {
    try {
      setSaving(true);
      setLocalTextSize(size);
      await updateTextSize(size);
    } catch (error) {
      Alert.alert('Error', 'Failed to save text size');
    } finally {
      setSaving(false);
    }
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
              
              <View style={styles.sizeButtonContainer}>
                <TouchableOpacity
                  style={[styles.sizeButton, localTextSize === 12 && styles.sizeButtonActive]}
                  onPress={() => handleTextSizeSelect(12)}
                  disabled={saving}
                >
                  <Text style={[styles.sizeButtonText, localTextSize === 12 && styles.sizeButtonTextActive]}>
                    Small (12px)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sizeButton, localTextSize === 14 && styles.sizeButtonActive]}
                  onPress={() => handleTextSizeSelect(14)}
                  disabled={saving}
                >
                  <Text style={[styles.sizeButtonText, localTextSize === 14 && styles.sizeButtonTextActive]}>
                    Medium (14px)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sizeButton, localTextSize === 16 && styles.sizeButtonActive]}
                  onPress={() => handleTextSizeSelect(16)}
                  disabled={saving}
                >
                  <Text style={[styles.sizeButtonText, localTextSize === 16 && styles.sizeButtonTextActive]}>
                    Default (16px)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sizeButton, localTextSize === 18 && styles.sizeButtonActive]}
                  onPress={() => handleTextSizeSelect(18)}
                  disabled={saving}
                >
                  <Text style={[styles.sizeButtonText, localTextSize === 18 && styles.sizeButtonTextActive]}>
                    Large (18px)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sizeButton, localTextSize === 20 && styles.sizeButtonActive]}
                  onPress={() => handleTextSizeSelect(20)}
                  disabled={saving}
                >
                  <Text style={[styles.sizeButtonText, localTextSize === 20 && styles.sizeButtonTextActive]}>
                    Extra Large (20px)
                  </Text>
                </TouchableOpacity>
              </View>
                
              <View style={styles.previewBox}>
                <Text style={[styles.previewText, { fontSize: localTextSize }]}>
                  Preview: This is how text will look in the app
                </Text>
              </View>
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
  sizeButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sizeButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center' as const,
  },
  sizeButtonActive: {
    backgroundColor: '#e0f2f1',
    borderColor: '#008080',
  },
  sizeButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#4b5563',
  },
  sizeButtonTextActive: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#008080',
  },
  previewBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  previewText: {
    color: '#1f2937',
    lineHeight: 24,
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
