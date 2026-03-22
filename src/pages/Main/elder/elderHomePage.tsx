import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    AppState,
    type AppStateStatus,
} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import { elderHomeStyles as styles } from "../../../global_style/elderUseSection/elderHomeStyles";
import auth from '@react-native-firebase/auth';
import { clearElderLocation, getElderCaregivers, getUserProfile, sendEmergencyAlert } from '../../../services/firestore';
import { requestLocationPermissions, startLocationTracking, checkLocationPermissions } from '../../../services/location';

/** Opens system Location screen (GPS / location mode), not the app’s App info page. */
async function openDeviceLocationSettings(): Promise<void> {
    if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
        );
    } else {
        Linking.openSettings();
    }
}

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
    const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
    const [locationServicesOn, setLocationServicesOn] = useState<boolean | null>(null);
    const stopTrackingRef = useRef<(() => void) | null>(null);

    const beginTracking = useCallback((uid: string) => {
        stopTrackingRef.current?.();
        stopTrackingRef.current = startLocationTracking(
            uid,
            30000,
            (error) => {
                console.error('[Location] Tracking error:', error);
            }
        );
    }, []);

    /** Re-read GPS + permission after returning from system Location settings (same tab stays focused). */
    const syncLocationFromSystem = useCallback(async () => {
        const user = auth().currentUser;
        if (!user) return;
        try {
            const servicesOn = await Location.hasServicesEnabledAsync();
            setLocationServicesOn(servicesOn);
            const perm = await checkLocationPermissions();
            setLocationEnabled(servicesOn && perm.granted);
            if (servicesOn && perm.granted) {
                beginTracking(user.uid);
            } else {
                stopTrackingRef.current?.();
                stopTrackingRef.current = null;
                const cleared = await clearElderLocation(user.uid);
                if (!cleared.success) {
                    console.warn('[Location] clearElderLocation:', cleared.error);
                }
            }
        } catch {
            /* ignore */
        }
    }, [beginTracking]);

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
        let mounted = true;

        const initializeLocation = async () => {
            try {
                const currentUser = auth().currentUser;
                if (!currentUser) {
                    setTimeout(() => {
                        if (mounted) {
                            initializeLocation();
                        }
                    }, 1000);
                    return;
                }

                const servicesOn = await Location.hasServicesEnabledAsync();
                if (mounted) setLocationServicesOn(servicesOn);

                if (!servicesOn) {
                    stopTrackingRef.current?.();
                    stopTrackingRef.current = null;
                    await clearElderLocation(currentUser.uid);
                }

                const permissionStatus = await checkLocationPermissions();
                if (mounted) {
                    setLocationEnabled(servicesOn && permissionStatus.granted);
                }

                if (servicesOn && permissionStatus.granted) {
                    beginTracking(currentUser.uid);
                } else if (servicesOn) {
                    const requestResult = await requestLocationPermissions();
                    if (mounted) {
                        setLocationEnabled(servicesOn && requestResult.granted);
                    }
                    if (requestResult.granted) {
                        beginTracking(currentUser.uid);
                    } else {
                        stopTrackingRef.current?.();
                        stopTrackingRef.current = null;
                        await clearElderLocation(currentUser.uid);
                        if (mounted && requestResult.message) {
                            Alert.alert(
                                'Location Permission Required',
                                requestResult.message + '\n\nPlease enable location permission in Settings to allow caregivers to track your location for safety.',
                                [{ text: 'OK' }]
                            );
                        }
                    }
                }
            } catch (error: any) {
                console.error('[Location] initialization error:', error);
                if (mounted) {
                    setLocationEnabled(false);
                    Alert.alert(
                        'Location Error',
                        'Failed to initialize location tracking: ' + (error?.message || 'Unknown error'),
                        [{ text: 'OK' }]
                    );
                }
            }
        };

        initializeLocation();

        return () => {
            mounted = false;
            stopTrackingRef.current?.();
            stopTrackingRef.current = null;
        };
    }, [beginTracking]);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
            if (next === 'active') {
                syncLocationFromSystem();
            }
        });
        return () => sub.remove();
    }, [syncLocationFromSystem]);

    const handleEnableLocationPress = async () => {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No authenticated user found');
            return;
        }

        const servicesOn = await Location.hasServicesEnabledAsync();
        setLocationServicesOn(servicesOn);
        if (!servicesOn) {
            Alert.alert(
                'Location is off',
                'Turn on device location, then come back to the app. You can open the system Location settings below.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open location settings', onPress: () => openDeviceLocationSettings() },
                ]
            );
            return;
        }

        const result = await requestLocationPermissions();
        setLocationEnabled(result.granted);
        if (result.granted) {
            beginTracking(currentUser.uid);
            try {
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                    mayShowUserSettingsDialog: false,
                });
            } catch {
                /* ignored */
            }
            Alert.alert('Success', 'Location is being shared with your caregivers.');
        } else if (result.message) {
            Alert.alert('Location permission needed', result.message, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'App settings', onPress: () => Linking.openSettings() },
            ]);
        }
    };

    // Fetch on mount and whenever screen comes into focus (e.g. after accepting a caregiver on Notification)
    useFocusEffect(
        useCallback(() => {
            fetchCaregivers();
            syncLocationFromSystem();
        }, [fetchCaregivers, syncLocationFromSystem])
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

                {/* Location — share with caregivers (GPS + app permission) */}
                <View
                    style={{
                        marginHorizontal: 20,
                        marginBottom: 16,
                        padding: 16,
                        borderRadius: 14,
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name="navigate-circle" size={22} color="#008080" />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginLeft: 8 }}>
                            Your location
                        </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 18 }}>
                        Turn on device location and allow this app to use it so caregivers can see you on the map.
                    </Text>

                    {locationEnabled === null || locationServicesOn === null ? (
                        <ActivityIndicator color="#008080" style={{ alignSelf: 'flex-start' }} />
                    ) : locationServicesOn === false ? (
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#ea580c',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => openDeviceLocationSettings()}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="location" size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
                                Turn on device location
                            </Text>
                        </TouchableOpacity>
                    ) : locationEnabled === false ? (
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#008080',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={handleEnableLocationPress}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="location-outline" size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
                                Allow location access
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#d1fae5',
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderRadius: 10,
                            }}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#059669" />
                            <Text style={{ color: '#047857', fontSize: 14, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                                Sharing location with caregivers
                            </Text>
                            <TouchableOpacity onPress={handleEnableLocationPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={{ color: '#008080', fontSize: 13, fontWeight: '600' }}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

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
        </SafeAreaView>
    );
}