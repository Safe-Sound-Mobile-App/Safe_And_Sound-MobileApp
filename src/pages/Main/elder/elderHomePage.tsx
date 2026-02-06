import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import { elderHomeStyles as styles } from "../../../global_style/elderUseSection/elderHomeStyles";

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
    const [caregivers, setCaregivers] = useState<CaregiverData[]>(mockCaregiverData);

    const handleChat = (id: string, name: string) => {
        console.log(`Chat with ${name}`);
    };

    const handleEmergency = () => {
        console.warn('EMERGENCY PRESSED');
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

                {/* List of Caregivers */}
                <View style={styles.listContainer}>
                    {caregivers.map(renderCaregiverCard)}
                </View>
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