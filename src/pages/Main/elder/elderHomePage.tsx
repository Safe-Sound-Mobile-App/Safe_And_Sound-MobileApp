import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import { elderHomeStyles as styles } from "../../../global_style/elderUseSection/elderHomeStyles";
import auth from '@react-native-firebase/auth';
import { getElderCaregivers, getUserProfile, updateElderHealthStatus, sendEmergencyAlert } from '../../../services/firestore';
import { requestLocationPermissions, startLocationTracking, checkLocationPermissions } from '../../../services/location';

const chatIcon = require('../../../../assets/icons/chat.png');
const defaultAvatar = require('../../../../assets/icons/elder.png');

interface CaregiverData {
    id: string;
    name: string;
    image: any;
    status: 'online' | 'offline' | 'busy';
}

const mockCaregiverData: CaregiverData[] = [
    { id: '1', name: 'Caregiver1', image: defaultAvatar, status: 'online' },
    { id: '2', name: 'Caregiver2', image: defaultAvatar, status: 'online' },
    { id: '3', name: 'Caregiver3', image: defaultAvatar, status: 'busy' },
];

type Props = NativeStackScreenProps<RootStackParamList, "ElderHomepage">;

export default function ElderHomepage({ navigation }: Props) {
    const [caregivers, setCaregivers] = useState<CaregiverData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [updatingHealth, setUpdatingHealth] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
    
    // Health data states
    const [heartRate, setHeartRate] = useState('70');
    const [spO2, setSpO2] = useState('98');
    const [gyroscope, setGyroscope] = useState<'Normal' | 'Fell'>('Normal');

    const fetchCaregivers = useCallback(async () => {
        try {
            const currentUser = auth().currentUser;
            if (!currentUser) {
                setLoading(false);
                return;
            }
            setLoading(true);

            const caregiversResult = await getElderCaregivers(currentUser.uid);

            if (caregiversResult.success && caregiversResult.data) {
                const transformedData: CaregiverData[] = await Promise.all(
                    caregiversResult.data.map(async (caregiver) => {
                        const userResult = await getUserProfile(caregiver.userId);
                        const userName = userResult.success && userResult.data
                            ? `${userResult.data.firstName} ${userResult.data.lastName}`
                            : 'Unknown';
                        const status = userResult.success && userResult.data
                            ? userResult.data.status
                            : 'offline';
                        const profileImage = userResult.success && userResult.data?.photoURL
                            ? { uri: userResult.data.photoURL }
                            : defaultAvatar;
                        return {
                            id: caregiver.userId,
                            name: userName,
                            image: profileImage,
                            status: status,
                        };
                    })
                );
                setCaregivers(transformedData);
            } else {
                setCaregivers([]);
            }
        } catch (error) {
            console.error('Error fetching caregivers:', error);
            setCaregivers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize location tracking
    useEffect(() => {
        let stopTracking: (() => void) | null = null;
        let mounted = true;

        const initializeLocation = async () => {
            try {
                const currentUser = auth().currentUser;
                if (!currentUser) {
                    console.log('[Location] No authenticated user, waiting...');
                    // Wait a bit and try again if user not ready
                    setTimeout(() => {
                        if (mounted) {
                            initializeLocation();
                        }
                    }, 1000);
                    return;
                }

                console.log('[Location] ===== Starting location initialization =====');
                console.log('[Location] Elder ID:', currentUser.uid);

                // Check current permission status
                console.log('[Location] Step 1: Checking current permission status...');
                const permissionStatus = await checkLocationPermissions();
                console.log('[Location] Permission status result:', JSON.stringify(permissionStatus, null, 2));
                setLocationEnabled(permissionStatus.granted);

                if (permissionStatus.granted) {
                    console.log('[Location] ✓ Permission already granted, starting tracking...');
                    // Start tracking location (updates every 30 seconds)
                    stopTracking = startLocationTracking(
                        currentUser.uid,
                        30000, // 30 seconds
                        (error) => {
                            if (mounted) {
                                console.error('[Location] Tracking error:', error);
                            }
                        }
                    );
                    console.log('[Location] ✓ Location tracking started');
                } else {
                    console.log('[Location] ✗ Permission not granted');
                    console.log('[Location] Step 2: Requesting permission...');
                    
                    // Request permission immediately
                    const requestResult = await requestLocationPermissions();
                    console.log('[Location] Request result:', JSON.stringify(requestResult, null, 2));
                    
                    if (mounted) {
                        setLocationEnabled(requestResult.granted);
                        if (requestResult.granted) {
                            console.log('[Location] ✓ Permission granted! Starting tracking...');
                            // Start tracking after permission granted
                            stopTracking = startLocationTracking(
                                currentUser.uid,
                                30000,
                                (error) => {
                                    if (mounted) {
                                        console.error('[Location] Tracking error:', error);
                                    }
                                }
                            );
                            console.log('[Location] ✓ Location tracking started');
                        } else {
                            console.log('[Location] ✗ Permission denied or not available');
                            console.log('[Location] Can ask again:', requestResult.canAskAgain);
                            if (requestResult.message) {
                                console.log('[Location] Message:', requestResult.message);
                                // Show alert to inform user
                                Alert.alert(
                                    'Location Permission Required',
                                    requestResult.message + '\n\nPlease enable location permission in Settings to allow caregivers to track your location for safety.',
                                    [
                                        {
                                            text: 'OK',
                                            style: 'default',
                                        },
                                    ]
                                );
                            }
                        }
                    }
                }
                console.log('[Location] ===== Location initialization complete =====');
            } catch (error: any) {
                console.error('[Location] ===== ERROR in location initialization =====');
                console.error('[Location] Error:', error);
                console.error('[Location] Error message:', error?.message);
                console.error('[Location] Error stack:', error?.stack);
                if (mounted) {
                    setLocationEnabled(false);
                    Alert.alert(
                        'Location Error',
                        'Failed to initialize location tracking: ' + (error?.message || 'Unknown error') + '\n\nPlease check console logs for details.',
                        [{ text: 'OK' }]
                    );
                }
            }
        };

        // Start immediately
        initializeLocation();

        return () => {
            mounted = false;
            if (stopTracking) {
                console.log('[Location] Cleaning up: Stopping location tracking');
                stopTracking();
            }
        };
    }, []);

    // Fetch on mount and whenever screen comes into focus (e.g. after accepting a caregiver on Notification)
    useFocusEffect(
        useCallback(() => {
            fetchCaregivers();
        }, [fetchCaregivers])
    );

    const handleChat = (caregiverId: string, caregiverName: string) => {
        navigation.navigate('ElderChatPage', { caregiverId, caregiverName });
    };

    const handleEmergency = async () => {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No authenticated user found');
            return;
        }

        Alert.alert(
            'Emergency Alert',
            'Are you sure you want to send an emergency alert to all your caregivers?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Send Alert',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Get user profile for name
                            const profileResult = await getUserProfile(currentUser.uid);
                            if (!profileResult.success || !profileResult.data) {
                                Alert.alert('Error', 'Failed to get user profile');
                                return;
                            }

                            const elderName = `${profileResult.data.firstName} ${profileResult.data.lastName}`;

                            // Send emergency alert
                            const result = await sendEmergencyAlert(currentUser.uid, elderName);

                            if (result.success) {
                                Alert.alert(
                                    'Alert Sent!',
                                    'Emergency alert has been sent to all your caregivers.',
                                    [{ text: 'OK' }]
                                );
                            } else {
                                Alert.alert('Error', result.error || 'Failed to send emergency alert');
                            }
                        } catch (error) {
                            console.error('Emergency alert error:', error);
                            Alert.alert('Error', 'An unexpected error occurred');
                        }
                    },
                },
            ]
        );
    };

    const handleUpdateHealth = async () => {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No authenticated user found');
            return;
        }

        // Validate inputs
        const hrValue = parseInt(heartRate);
        const spo2Value = parseInt(spO2);

        if (isNaN(hrValue) || hrValue < 30 || hrValue > 200) {
            Alert.alert('Error', 'Heart rate must be between 30-200 bpm');
            return;
        }

        if (isNaN(spo2Value) || spo2Value < 0 || spo2Value > 100) {
            Alert.alert('Error', 'SpO2 must be between 0-100%');
            return;
        }

        setUpdatingHealth(true);
        try {
            const result = await updateElderHealthStatus(
                currentUser.uid,
                hrValue,
                spo2Value,
                gyroscope
            );

            if (result.success) {
                Alert.alert('Success', 'Health data updated successfully!');
                setShowHealthModal(false);
            } else {
                Alert.alert('Error', result.error || 'Failed to update health data');
            }
        } catch (error) {
            console.error('Update health error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setUpdatingHealth(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return '#4ade80';
            case 'busy': return '#ef4444';
            case 'offline': return '#9ca3af';
            default: return '#9ca3af';
        }
    };

    const renderCaregiverCard = (caregiver: CaregiverData) => {
        const statusColor = getStatusColor(caregiver.status);

        return (
            <View key={caregiver.id} style={styles.card}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={caregiver.image}
                        style={styles.avatar}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.caregiverName}>{caregiver.name}</Text>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Status: </Text>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => handleChat(caregiver.id, caregiver.name)}
                >
                    <Image
                        source={chatIcon}
                        style={styles.chatIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <GradientHeader />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Title Section */}
                <View style={styles.headerRow}>
                    <Text style={styles.pageTitle}>Your Caregivers</Text>
                    <Text style={styles.countText}>{caregivers.length}/5</Text>
                </View>

                {/* Update Health Data Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#008080',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        marginHorizontal: 20,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => setShowHealthModal(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="fitness-outline" size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
                        Update Health Data
                    </Text>
                </TouchableOpacity>

                {/* Location Status Button (for testing) */}
                {locationEnabled === false && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#f59e0b',
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            borderRadius: 12,
                            marginHorizontal: 20,
                            marginBottom: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={async () => {
                            const currentUser = auth().currentUser;
                            if (!currentUser) {
                                Alert.alert('Error', 'No authenticated user found');
                                return;
                            }
                            const result = await requestLocationPermissions();
                            setLocationEnabled(result.granted);
                            if (result.granted) {
                                Alert.alert('Success', 'Location permission granted! Location tracking will start automatically.');
                            } else {
                                Alert.alert('Permission Denied', result.message || 'Location permission is required.');
                            }
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="location-outline" size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
                            Enable Location Tracking
                        </Text>
                    </TouchableOpacity>
                )}
                
                {locationEnabled === true && (
                    <View style={{
                        backgroundColor: '#d1fae5',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        marginHorizontal: 20,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Ionicons name="checkmark-circle" size={20} color="#059669" />
                        <Text style={{ color: '#059669', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
                            Location Tracking Active
                        </Text>
                    </View>
                )}

                {/* Loading State */}
                {loading && (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#008080" />
                        <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
                            Loading caregivers...
                        </Text>
                    </View>
                )}

                {/* Empty State */}
                {!loading && caregivers.length === 0 && (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Ionicons name="people-outline" size={64} color="#d1d5db" />
                        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                            No caregivers yet
                        </Text>
                        <Text style={{ marginTop: 8, color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
                            Ask a caregiver to add you to their care list
                        </Text>
                    </View>
                )}

                {/* List of Caregivers */}
                {!loading && caregivers.length > 0 && (
                    <View style={styles.listContainer}>
                        {caregivers.map(renderCaregiverCard)}
                    </View>
                )}
            </ScrollView>

            {/* Emergency Button - Placed Outside ScrollView to float at bottom */}
            <View style={styles.emergencyContainer}>
                <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={handleEmergency}
                    activeOpacity={0.8}
                >
                    <Text style={styles.emergencyText}>Emergency</Text>
                </TouchableOpacity>
            </View>

            {/* Update Health Data Modal */}
            <Modal
                visible={showHealthModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowHealthModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}>
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 24,
                        width: '100%',
                        maxWidth: 400,
                    }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>
                            Update Health Data
                        </Text>

                        {/* Heart Rate Input */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>
                                Heart Rate (bpm)
                            </Text>
                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    borderRadius: 10,
                                    padding: 12,
                                    fontSize: 16,
                                }}
                                placeholder="70"
                                keyboardType="numeric"
                                value={heartRate}
                                onChangeText={setHeartRate}
                                editable={!updatingHealth}
                            />
                        </View>

                        {/* SpO2 Input */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>
                                SpO2 (%)
                            </Text>
                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    borderRadius: 10,
                                    padding: 12,
                                    fontSize: 16,
                                }}
                                placeholder="98"
                                keyboardType="numeric"
                                value={spO2}
                                onChangeText={setSpO2}
                                editable={!updatingHealth}
                            />
                        </View>

                        {/* Gyroscope Status */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
                                Movement Status
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: gyroscope === 'Normal' ? '#008080' : '#d1d5db',
                                        backgroundColor: gyroscope === 'Normal' ? '#f0fdfa' : '#fff',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => setGyroscope('Normal')}
                                    disabled={updatingHealth}
                                >
                                    <Text style={{
                                        color: gyroscope === 'Normal' ? '#008080' : '#6b7280',
                                        fontWeight: gyroscope === 'Normal' ? '600' : '400',
                                    }}>
                                        Normal
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        padding: 12,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: gyroscope === 'Fell' ? '#ef4444' : '#d1d5db',
                                        backgroundColor: gyroscope === 'Fell' ? '#fef2f2' : '#fff',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => setGyroscope('Fell')}
                                    disabled={updatingHealth}
                                >
                                    <Text style={{
                                        color: gyroscope === 'Fell' ? '#ef4444' : '#6b7280',
                                        fontWeight: gyroscope === 'Fell' ? '600' : '400',
                                    }}>
                                        Fell
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    alignItems: 'center',
                                }}
                                onPress={() => setShowHealthModal(false)}
                                disabled={updatingHealth}
                            >
                                <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '600' }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    borderRadius: 10,
                                    backgroundColor: '#008080',
                                    alignItems: 'center',
                                    opacity: updatingHealth ? 0.6 : 1,
                                }}
                                onPress={handleUpdateHealth}
                                disabled={updatingHealth}
                            >
                                {updatingHealth ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                                        Update
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}