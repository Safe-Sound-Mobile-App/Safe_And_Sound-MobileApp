import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const elderNotificationStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    // --- Title Section ---
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

    // --- Tabs ---
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 12,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#e5e7eb',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'BalooBhaijaan2_400Regular',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#374151',
        fontWeight: '700',
    },

    // --- Filter Button ---
    filterContainer: {
        alignItems: 'flex-end',
        marginBottom: 15,
        zIndex: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        gap: 6,
    },
    filterText: {
        fontSize: 13,
        color: '#6b7280',
        fontFamily: 'BalooBhaijaan2_400Regular',
    },

    // --- List Container ---
    notificationsList: {
        paddingBottom: 120, // Increased padding to ensure content isn't hidden behind the Emergency button
    },

    // --- Caregiver Request Card ---
    requestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarContainer: {
        marginRight: 15,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#d1d5db',
    },
    requestContent: {
        flex: 1,
    },
    caregiverName: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'BalooBhaijaan2_600SemiBold',
        color: '#374151',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconButton: {
        padding: 5,
    },

    // --- Activity Badge ---
    activityBadge: {
        borderRadius: 15,
        padding: 18,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
        zIndex: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)'
    },
    activityContent: {
    },
    activityTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingRight: 20,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'BalooBhaijaan2_600SemiBold',
    },
    alertIcon: {
        width: 20,
        height: 20,
    },
    activityMessage: {
        fontSize: 15,
        fontFamily: 'BalooBhaijaan2_400Regular',
        lineHeight: 22,
        marginBottom: 8,
    },
    activityTimestamp: {
        fontSize: 13,
        fontFamily: 'BalooBhaijaan2_400Regular',
        color: '#000000',
        textAlign: 'right',
    },

    // --- Emergency Button ---
    emergencyContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    emergencyButton: {
        backgroundColor: '#d64d4d', // Soft red as seen in image
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 30,
        shadowColor: '#d64d4d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    emergencyText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'BalooBhaijaan2_600SemiBold',
        letterSpacing: 0.5,
    },

    // --- Filter Modal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterModal: {
        width: width * 0.85,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    filterModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'BalooBhaijaan2_600SemiBold',
        color: '#374151',
        marginBottom: 20,
        textAlign: 'center',
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    filterOptionText: {
        fontSize: 16,
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
        marginTop: 25,
        backgroundColor: '#374151',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    applyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'BalooBhaijaan2_600SemiBold',
        letterSpacing: 0.5,
    },
});