import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const addNewElderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  titleIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    tintColor: '#374151',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'BalooBhaijaan2_400Regular',
  },
  searchIconButton: {
    padding: 4,
  },
  resultsContainer: {
    paddingBottom: 100, // Space for navbar
  },
  searchingText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'BalooBhaijaan2_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'BalooBhaijaan2_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  elderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
  },
  elderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginLeft: 15,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});