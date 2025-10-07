import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base font sizes - will be scaled by FontSizeContext
const baseFontSizes = {
  appTitle: 24,
  sectionTitle: 24,
  elderName: 16,
  riskText: 14,
  addButtonText: 12,
  elderCount: 14,
  vitalLabel: 14,
  vitalValue: 14,
};

export const caregiverHomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 90,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  appTitle: {
    // fontSize: baseFontSizes.appTitle, // Will be scaled by context
    fontSize: 30,
    fontWeight: '900',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#008080',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleContainer: {
    height: 30,
  },
  titleMask: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  gradientTitle: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: 'transparent',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10, // เพิ่ม spacing ระหว่าง title และ button
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: baseFontSizes.sectionTitle,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: baseFontSizes.addButtonText,
    fontWeight: '600',
    fontFamily: 'BalooBhaijaan2_400Regular',
    marginLeft: 4,
  },
  elderCountContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  elderCount: {
    fontSize: baseFontSizes.elderCount,
    color: '#6b7280',
    fontFamily: 'BalooBhaijaan2_400Regular',
  },
  cardsContainer: {
    paddingBottom: 100, // Space for navigation bar
  },
  elderCard: {
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
  },
  elderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  elderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elderName: {
    fontSize: baseFontSizes.elderName,
    fontWeight: '600',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginRight: 6,
  },
  riskIcon: {
    marginLeft: 4,
  },
  riskText: {
    fontSize: baseFontSizes.riskText,
    fontFamily: 'BalooBhaijaan2_400Regular',
    marginTop: 2,
  },
  chatButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardBody: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  vitalSignsContainer: {
    flex: 1,
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalLabel: {
    fontSize: baseFontSizes.vitalLabel,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
    flex: 1,
  },
  vitalValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  vitalValue: {
    fontSize: baseFontSizes.vitalValue,
    fontWeight: '500',
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
    marginRight: 4,
  },
  nextButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 15,
  },
});

// Function to create dynamic styles with font scaling
export const createCaregiverHomeStyles = (getFontSize: (size: number) => number) => {
  return StyleSheet.create({
    ...caregiverHomeStyles,
    appTitle: {
      ...caregiverHomeStyles.appTitle,
      fontSize: getFontSize(baseFontSizes.appTitle),
    },
    sectionTitle: {
      ...caregiverHomeStyles.sectionTitle,
      fontSize: getFontSize(baseFontSizes.sectionTitle),
    },
    addButtonText: {
      ...caregiverHomeStyles.addButtonText,
      fontSize: getFontSize(baseFontSizes.addButtonText),
    },
    elderCount: {
      ...caregiverHomeStyles.elderCount,
      fontSize: getFontSize(baseFontSizes.elderCount),
    },
    elderName: {
      ...caregiverHomeStyles.elderName,
      fontSize: getFontSize(baseFontSizes.elderName),
    },
    riskText: {
      ...caregiverHomeStyles.riskText,
      fontSize: getFontSize(baseFontSizes.riskText),
    },
    vitalLabel: {
      ...caregiverHomeStyles.vitalLabel,
      fontSize: getFontSize(baseFontSizes.vitalLabel),
    },
    vitalValue: {
      ...caregiverHomeStyles.vitalValue,
      fontSize: getFontSize(baseFontSizes.vitalValue),
    },
  });
};