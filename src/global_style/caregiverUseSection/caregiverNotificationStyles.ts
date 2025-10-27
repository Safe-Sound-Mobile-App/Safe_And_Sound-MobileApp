import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const notificationStyles = StyleSheet.create({
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
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#374151',
    fontWeight: '700',
  },

  // Filter
  filterContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'BalooBhaijaan2_400Regular',
  },

  // Notifications List
  notificationsList: {
    paddingBottom: 100,
  },

  // Elder Accept Badge
  elderAcceptBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  badgeContent: {
    marginBottom: 8,
  },
  elderAcceptTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  elderAcceptMessage: {
    fontSize: 14,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#6b7280',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#9ca3af',
    textAlign: 'right',
  },

  // Activity Badge
  activityBadge: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  activityContent: {
    marginBottom: 8,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
  },
  alertIcon: {
    width: 16,
    height: 16,
  },
  activityMessage: {
    fontSize: 14,
    fontFamily: 'BalooBhaijaan2_400Regular',
    lineHeight: 20,
  },
  activityTimestamp: {
    fontSize: 12,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#000000',
    textAlign: 'right',
  },

  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    width: width * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#374151',
    marginBottom: 15,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterOptionText: {
    fontSize: 15,
    fontFamily: 'BalooBhaijaan2_400Regular',
    color: '#374151',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#008080',
    borderColor: '#008080',
  },
  applyButton: {
    marginTop: 20,
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    letterSpacing: 1,
  },
});