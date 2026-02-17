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

export const elderHomeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40, // Space for bottom navbar
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 15,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
    },
    countText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 5,
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    // Card Styles
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Shadow for Android
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    avatarContainer: {
        marginRight: 15,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#d1d5db', // Gray circle placeholder
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#d1d5db', // Fallback background color
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    caregiverName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 4,
    },
    chatButton: {
        padding: 8,
    },
    chatIcon: {
        width: 28,
        height: 28,
        tintColor: '#1f2937',
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
});