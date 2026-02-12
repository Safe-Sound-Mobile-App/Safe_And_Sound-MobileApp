import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilitySettings {
  textSize: number;
  highContrast: boolean;
  language: 'th' | 'en';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateTextSize: (size: number) => Promise<void>;
  updateHighContrast: (enabled: boolean) => Promise<void>;
  updateLanguage: (lang: 'th' | 'en') => Promise<void>;
  loading: boolean;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 16,
  highContrast: false,
  language: 'th',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = '@accessibility_settings';

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
      throw error;
    }
  };

  const updateTextSize = async (size: number) => {
    const newSettings = { ...settings, textSize: size };
    await saveSettings(newSettings);
  };

  const updateHighContrast = async (enabled: boolean) => {
    const newSettings = { ...settings, highContrast: enabled };
    await saveSettings(newSettings);
  };

  const updateLanguage = async (lang: 'th' | 'en') => {
    const newSettings = { ...settings, language: lang };
    await saveSettings(newSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateTextSize,
        updateHighContrast,
        updateLanguage,
        loading,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
