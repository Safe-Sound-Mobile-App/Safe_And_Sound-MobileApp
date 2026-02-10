import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import { elderHomeStyles as styles } from "../../../global_style/elderUseSection/elderHomeStyles";
import auth from '@react-native-firebase/auth';
import { getElderCaregivers, getUserProfile } from '../../../services/firestore';

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

    // Fetch caregivers data from Firestore
    useEffect(() => {
        const fetchCaregivers = async () => {
            try {
                const currentUser = auth().currentUser;
                if (!currentUser) {
                    Alert.alert('Error', 'No authenticated user found');
                    setLoading(false);
                    return;
                }

                // Get caregivers for this elder
                const caregiversResult = await getElderCaregivers(currentUser.uid);

                if (caregiversResult.success && caregiversResult.data) {
                    // Transform Caregiver data to CaregiverData format
                    const transformedData: CaregiverData[] = await Promise.all(
                        caregiversResult.data.map(async (caregiver) => {
                            // Get user info (firstName, lastName, status)
                            const userResult = await getUserProfile(caregiver.userId);
                            const userName = userResult.success && userResult.data
                                ? `${userResult.data.firstName} ${userResult.data.lastName}`
                                : 'Unknown';
                            const status = userResult.success && userResult.data
                                ? userResult.data.status
                                : 'offline';

                            return {
                                id: caregiver.userId,
                                name: userName,
                                image: defaultAvatar,
                                status: status,
                            };
                        })
                    );

                    setCaregivers(transformedData);
                } else {
                    // No caregivers found or error
                    setCaregivers([]);
                }
            } catch (error) {
                console.error('Error fetching caregivers:', error);
                Alert.alert('Error', 'Failed to load caregiver data');
            } finally {
                setLoading(false);
            }
        };

        fetchCaregivers();
    }, []);

    const handleChat = (id: string, name: string) => {
        console.log(`Chat with ${name}`);
    };

    const handleEmergency = () => {
        console.warn('EMERGENCY PRESSED');
        Alert.alert('Emergency', 'Emergency alert sent to all caregivers!');
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
                    <View style={styles.avatarPlaceholder} />
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