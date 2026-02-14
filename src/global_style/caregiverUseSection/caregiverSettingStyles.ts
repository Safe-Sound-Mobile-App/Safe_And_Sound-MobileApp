import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const caregiverSettingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_700Bold',
    color: '#000000',
    marginTop: 25,
    marginBottom: 25,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 30, // Space for navbar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'BalooBhaijaan2_500Medium',
    color: '#1f2937',
    flex: 1,
  },
});