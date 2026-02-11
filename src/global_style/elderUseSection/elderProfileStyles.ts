import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flex: 1,
    },

    // Background Section
    backgroundContainer: {
        position: 'relative',
        marginBottom: 80,
        marginTop: -30, // เพิ่มจาก -20 → -30 เพื่อลบช่องว่าง
    },
    backgroundImageWrapper: {
        width: '100%',
        height: 140, // ลดจาก 200 → 140
        backgroundColor: '#e5e7eb',
        position: 'relative',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    backgroundPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e5e7eb',
    },
    backgroundCameraButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cameraIcon: {
        width: 20,
        height: 20,
        tintColor: '#6b7280',
    },

    // Profile Picture
    profileImageContainer: {
        position: 'absolute',
        bottom: -60,
        alignSelf: 'center',
    },
    profileImageGradientBorder: {
        width: 130,
        height: 130,
        borderRadius: 65,
        padding: 3,
    },
    profileImageWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 62,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profileImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileCameraIcon: {
        width: 40,
        height: 40,
        tintColor: '#9ca3af',
    },

    // Edit Button
    editButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 36,
        height: 36,
        backgroundColor: '#ffffff',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    editIcon: {
        width: 18,
        height: 18,
        tintColor: '#374151',
    },

    // Profile Information
    infoContainer: {
        paddingHorizontal: 30,
        paddingTop: 10,
    },
    fullName: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'BalooBhaijaan2_600SemiBold',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 8,
    },
    uid: {
        fontSize: 14,
        fontFamily: 'BalooBhaijaan2_400Regular',
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 30,
    },

    // Info List
    infoList: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    infoIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
        tintColor: '#6b7280',
    },
    infoLabel: {
        fontSize: 15,
        fontFamily: 'BalooBhaijaan2_400Regular',
        color: '#6b7280',
        marginRight: 8,
    },
    infoValue: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'BalooBhaijaan2_600SemiBold',
        color: '#374151',
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