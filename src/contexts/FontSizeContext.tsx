import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Font Size Scale Options
export type FontSizeScale = 'small' | 'medium' | 'large' | 'extra-large';

// Font Size Multipliers
const FONT_SIZE_MULTIPLIERS: Record<FontSizeScale, number> = {
  'small': 0.85,
  'medium': 1.0,    // Default
  'large': 1.15,
  'extra-large': 1.3,
};

// Font Size Context Interface
interface FontSizeContextType {
  fontScale: FontSizeScale;
  fontMultiplier: number;
  setFontScale: (scale: FontSizeScale) => void;
  getFontSize: (baseSize: number) => number;
}

// Create Context
const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

// Font Size Provider Props
interface FontSizeProviderProps {
  children: ReactNode;
}

// Font Size Provider Component
export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({ children }) => {
  const [fontScale, setFontScale] = useState<FontSizeScale>('medium');
  const [fontMultiplier, setFontMultiplier] = useState<number>(1.0);

  // Update multiplier when scale changes
  useEffect(() => {
    setFontMultiplier(FONT_SIZE_MULTIPLIERS[fontScale]);
  }, [fontScale]);

  // Function to get scaled font size
  const getFontSize = (baseSize: number): number => {
    return Math.round(baseSize * fontMultiplier);
  };

  // Load font scale from storage (AsyncStorage) in the future
  useEffect(() => {
    loadFontScale();
  }, []);

  // Save font scale to storage when changed
  useEffect(() => {
    saveFontScale();
  }, [fontScale]);

  // Load font scale from storage (placeholder for AsyncStorage)
  const loadFontScale = async () => {
    try {
      // TODO: Implement AsyncStorage.getItem('fontScale')
      // const savedScale = await AsyncStorage.getItem('fontScale');
      // if (savedScale && FONT_SIZE_MULTIPLIERS[savedScale as FontSizeScale]) {
      //   setFontScale(savedScale as FontSizeScale);
      // }
      console.log('Loading font scale from storage...');
    } catch (error) {
      console.error('Error loading font scale:', error);
    }
  };

  // Save font scale to storage (placeholder for AsyncStorage)
  const saveFontScale = async () => {
    try {
      // TODO: Implement AsyncStorage.setItem('fontScale', fontScale)
      // await AsyncStorage.setItem('fontScale', fontScale);
      console.log(`Saving font scale: ${fontScale}`);
    } catch (error) {
      console.error('Error saving font scale:', error);
    }
  };

  const value: FontSizeContextType = {
    fontScale,
    fontMultiplier,
    setFontScale,
    getFontSize,
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};

// Custom Hook to use Font Size Context
export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

// Utility function to get font size without hook (for StyleSheet)
export const getScaledFontSize = (baseSize: number, scale: FontSizeScale = 'medium'): number => {
  return Math.round(baseSize * FONT_SIZE_MULTIPLIERS[scale]);
};

// Export font size scales for settings page
export const FONT_SIZE_SCALES: { label: string; value: FontSizeScale }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'extra-large' },
];