import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Base font sizes
const baseFontSizes = {
  elderName: 16,
  riskText: 14,
  vitalLabel: 14,
  vitalValue: 14,
  chartLabel: 14,
  sectionTitle: 20,
  infoSubtitle: 16,
  infoLabel: 14,
  infoValue: 14,
  coordinatesText: 12,
};

export const caregiverElderInfoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Elder Card Styles
  elderCard: {
    borderRadius: 15,
    marginTop: 20,
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
  riskText: {
    fontSize: baseFontSizes.riskText,
    fontFamily: 'BalooBhaijaan2_400Regular',
    marginTop: 2,
  },
  chatButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Vital Signs Card
  vitalSignsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vitalItem: {
    marginBottom: 20,
  },
  vitalLabel: {
    fontSize: baseFontSizes.vitalLabel,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
    marginBottom: 5,
  },
  vitalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalValue: {
    fontSize: baseFontSizes.vitalValue,
    fontWeight: '500',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
  },

  // Chart Styles
  chartContainer: {
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartLabel: {
    fontSize: baseFontSizes.chartLabel,
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginRight: 6,
  },
  chart: {
    borderRadius: 10,
    marginVertical: 8,
  },

  // Info Card Styles
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: baseFontSizes.sectionTitle,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSubtitle: {
    fontSize: baseFontSizes.infoSubtitle,
    fontWeight: '600',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: baseFontSizes.infoLabel,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: baseFontSizes.infoValue,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
    flex: 2,
  },

  // Location Styles
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  coordinatesText: {
    fontSize: baseFontSizes.coordinatesText,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
  },

  // Map Styles
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e5e7eb',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapMarkerOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -32 }],
  },
});

// Function to create dynamic styles with font scaling
export const createCaregiverElderInfoStyles = (getFontSize: (size: number) => number) => {
  return StyleSheet.create({
    ...caregiverElderInfoStyles,
    elderName: {
      ...caregiverElderInfoStyles.elderName,
      fontSize: getFontSize(baseFontSizes.elderName),
    },
    riskText: {
      ...caregiverElderInfoStyles.riskText,
      fontSize: getFontSize(baseFontSizes.riskText),
    },
    vitalLabel: {
      ...caregiverElderInfoStyles.vitalLabel,
      fontSize: getFontSize(baseFontSizes.vitalLabel),
    },
    vitalValue: {
      ...caregiverElderInfoStyles.vitalValue,
      fontSize: getFontSize(baseFontSizes.vitalValue),
    },
    chartLabel: {
      ...caregiverElderInfoStyles.chartLabel,
      fontSize: getFontSize(baseFontSizes.chartLabel),
    },
    sectionTitle: {
      ...caregiverElderInfoStyles.sectionTitle,
      fontSize: getFontSize(baseFontSizes.sectionTitle),
    },
    infoSubtitle: {
      ...caregiverElderInfoStyles.infoSubtitle,
      fontSize: getFontSize(baseFontSizes.infoSubtitle),
    },
    infoLabel: {
      ...caregiverElderInfoStyles.infoLabel,
      fontSize: getFontSize(baseFontSizes.infoLabel),
    },
    infoValue: {
      ...caregiverElderInfoStyles.infoValue,
      fontSize: getFontSize(baseFontSizes.infoValue),
    },
    coordinatesText: {
      ...caregiverElderInfoStyles.coordinatesText,
      fontSize: getFontSize(baseFontSizes.coordinatesText),
    },
  });
};