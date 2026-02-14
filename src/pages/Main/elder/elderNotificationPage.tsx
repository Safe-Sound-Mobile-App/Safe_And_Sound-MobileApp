import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { elderNotificationStyles } from '../../../global_style/elderUseSection/elderNotificationStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabParamList } from "../../../App";
import auth from '@react-native-firebase/auth';
import { listenToNotifications, getPendingCaregiverRequests, respondToCaregiverRequest, markNotificationAsRead, Notification } from '../../../services/firestore';

// --- Icons ---
const notificationIcon = require('../../../../assets/icons/navbar/notification.png');
const triangleIcon = require('../../../../assets/icons/alert/triangle-exclamation.png');
const diamondIcon = require('../../../../assets/icons/alert/diamond-exclamation.png');
const filterIcon = require('../../../../assets/icons/filter.png');
const downArrowIcon = require('../../../../assets/icons/direction/down.png');

type CombinedNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Notification'>,
    NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
    navigation: CombinedNavigationProp;
};

export default function ElderNotification({ navigation }: Props) {
    // Tabs: 'caregiver_request' or 'activities'
    const [activeTab, setActiveTab] = useState<'caregiver_request' | 'activities'>('caregiver_request');

    // Data States
    const [requests, setRequests] = useState<Array<{ id: string; caregiverId: string; caregiverName: string; caregiverPhotoURL: string | null }>>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    useEffect(() => {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No authenticated user');
            setLoading(false);
            return;
        }

        // Listen to notifications
        const unsubscribeNotifications = listenToNotifications(
            currentUser.uid,
            (newNotifications) => {
                setNotifications(newNotifications);
            },
            (error) => {
                console.error('Notifications error:', error);
            }
        );

        // Listen to caregiver requests
        const unsubscribeRequests = getPendingCaregiverRequests(
            currentUser.uid,
            (newRequests) => {
                setRequests(newRequests);
                setLoading(false);
            },
            (error) => {
                console.error('Requests error:', error);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeNotifications();
            unsubscribeRequests();
        };
    }, []);

    // --- Handlers: Requests ---
    const handleAcceptRequest = async (id: string, name: string) => {
        const result = await respondToCaregiverRequest(id, true);
        if (result.success) {
            Alert.alert("Request Accepted", `You have accepted ${name}.`);
        } else {
            Alert.alert("Error", result.error || 'Failed to accept request');
        }
    };

    const handleDeclineRequest = async (id: string, name: string) => {
        const result = await respondToCaregiverRequest(id, false);
        if (result.success) {
            Alert.alert("Request Declined", `You have declined ${name}.`);
        } else {
            Alert.alert("Error", result.error || 'Failed to decline request');
        }
    };

    // --- Handlers: Activities ---
    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'message': return '#ffffff';
            case 'danger': return '#fca5a5'; // Light Red
            case 'warning': return '#fcd34d'; // Yellow/Gold
            default: return '#ffffff';
        }
    };

    const getNotificationTextColor = (type: string) => {
        switch (type) {
            case 'message': return '#374151'; // Dark Grey
            case 'danger': return '#991b1b';  // Dark Red Text
            case 'warning': return '#92400e'; // Dark Brown/Orange Text
            default: return '#374151';
        }
    };

    // --- Filter Logic ---
    const toggleFilter = (filter: string) => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const getFilteredNotifications = () => {
        if (activeFilters.length === 0) return notifications;

        return notifications.filter(notif => {
            if (activeFilters.includes('Unread') && !notif.read) return true;
            if (activeFilters.includes('Message') && notif.type === 'message') return true;
            if (activeFilters.includes('Danger Alert') && notif.type === 'danger') return true;
            if (activeFilters.includes('Warning Alert') && notif.type === 'warning') return true;
            return false;
        });
    };

    // --- Render Items ---
    const accountIcon = require('../../../../assets/icons/navbar/account.png'); // fallback when no caregiver photo
    const renderCaregiverRequest = (item: { id: string; caregiverId: string; caregiverName: string; caregiverPhotoURL: string | null }) => (
        <View key={item.id} style={elderNotificationStyles.requestCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                    source={item.caregiverPhotoURL ? { uri: item.caregiverPhotoURL } : accountIcon}
                    style={elderNotificationStyles.avatarImage}
                    resizeMode="cover"
                />
                <View style={{ marginLeft: 15 }}>
                    <Text style={elderNotificationStyles.caregiverName}>{item.caregiverName}</Text>
                </View>
            </View>

            <View style={elderNotificationStyles.actionButtons}>
                <TouchableOpacity
                    style={elderNotificationStyles.iconButton}
                    onPress={() => handleDeclineRequest(item.id, item.caregiverName)}
                >
                    <Ionicons name="close-outline" size={28} color="#dc2626" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={elderNotificationStyles.iconButton}
                    onPress={() => handleAcceptRequest(item.id, item.caregiverName)}
                >
                    <Ionicons name="checkmark-outline" size={28} color="#16a34a" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderActivityBadge = (notif: Notification) => {
        const handleTap = async () => {
            if (!notif.read) {
                await markNotificationAsRead(notif.id);
            }
        };
        const isDanger = notif.type === 'danger' || notif.type === 'emergency';
        const isWarning = notif.type === 'warning';

        return (
            <TouchableOpacity
                key={notif.id}
                style={[
                    elderNotificationStyles.activityBadge,
                    { backgroundColor: getNotificationColor(notif.type) }
                ]}
                onPress={handleTap}
                activeOpacity={0.8}
            >
                {!notif.read && <View style={elderNotificationStyles.unreadDot} />}

                <View style={elderNotificationStyles.activityContent}>
                    <View style={elderNotificationStyles.activityTitleRow}>
                        <Text style={[
                            elderNotificationStyles.activityTitle,
                            { color: notif.type === 'message' ? '#374151' : (isDanger ? '#dc2626' : '#d97706') }
                        ]}>
                            {notif.title}
                        </Text>
                        {notif.type !== 'message' && (
                            <Image
                                source={isDanger ? triangleIcon : diamondIcon}
                                style={elderNotificationStyles.alertIcon}
                                resizeMode="contain"
                            />
                        )}
                    </View>

                    <Text style={[
                        elderNotificationStyles.activityMessage,
                        { color: notif.type === 'message' ? '#6b7280' : (isDanger ? '#7f1d1d' : '#78350f') }
                    ]}>
                        {notif.message}
                    </Text>
                </View>

                <Text style={elderNotificationStyles.activityTimestamp}>
                    {notif.timestamp.toLocaleDateString()} - {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={elderNotificationStyles.container}>
            <GradientHeader title="Safe & Sound" />

            <ScrollView
                style={elderNotificationStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Title Section */}
                <View style={elderNotificationStyles.titleSection}>
                    <Image
                        source={notificationIcon}
                        style={elderNotificationStyles.titleIcon}
                        resizeMode="contain"
                    />
                    <Text style={elderNotificationStyles.title}>Notification</Text>
                </View>

                {/* Tab Buttons */}
                <View style={elderNotificationStyles.tabContainer}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => setActiveTab('caregiver_request')}
                        activeOpacity={0.7}
                    >
                        {activeTab === 'caregiver_request' ? (
                            <LinearGradient
                                colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                                locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ borderRadius: 25, padding: 3 }}
                            >
                                <View style={[elderNotificationStyles.tabButton, { backgroundColor: '#e5e7eb', borderWidth: 0 }]}>
                                    <Text style={[elderNotificationStyles.tabText, elderNotificationStyles.tabTextActive]}>
                                        Caregiver Request
                                    </Text>
                                </View>
                            </LinearGradient>
                        ) : (
                            <View style={elderNotificationStyles.tabButton}>
                                <Text style={elderNotificationStyles.tabText}>Caregiver Request</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => setActiveTab('activities')}
                        activeOpacity={0.7}
                    >
                        {activeTab === 'activities' ? (
                            <LinearGradient
                                colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                                locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ borderRadius: 25, padding: 3 }}
                            >
                                <View style={[elderNotificationStyles.tabButton, { backgroundColor: '#e5e7eb', borderWidth: 0 }]}>
                                    <Text style={[elderNotificationStyles.tabText, elderNotificationStyles.tabTextActive]} numberOfLines={1}>
                                        Activities
                                    </Text>
                                </View>
                            </LinearGradient>
                        ) : (
                            <View style={elderNotificationStyles.tabButton}>
                                <Text style={elderNotificationStyles.tabText} numberOfLines={1}>Activities</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Filter Button (Only Visible on Activities Tab) */}
                {activeTab === 'activities' && (
                    <View style={elderNotificationStyles.filterContainer}>
                        <TouchableOpacity
                            style={elderNotificationStyles.filterButton}
                            onPress={() => setShowFilterModal(true)}
                        >
                            <Image
                                source={filterIcon}
                                style={{ width: 14, height: 14, tintColor: "#6b7280" }}
                                resizeMode="contain"
                            />
                            <Text style={elderNotificationStyles.filterText}>
                                Filter by: {activeFilters.length > 0 ? activeFilters.join(', ') : 'None'}
                            </Text>
                            <Image
                                source={downArrowIcon}
                                style={{ width: 12, height: 12, tintColor: "#6b7280" }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Lists */}
                <View style={elderNotificationStyles.notificationsList}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#008080" style={{ marginTop: 40 }} />
                    ) : activeTab === 'caregiver_request' ? (
                        requests.length > 0 ? (
                            requests.map(renderCaregiverRequest)
                        ) : (
                            <Text style={{textAlign: 'center', color: '#9ca3af', marginTop: 20}}>No new requests</Text>
                        )
                    ) : (
                        getFilteredNotifications().length > 0 ? (
                            getFilteredNotifications().map(renderActivityBadge)
                        ) : (
                            <Text style={{textAlign: 'center', color: '#9ca3af', marginTop: 20}}>No activity notifications</Text>
                        )
                    )}
                </View>
            </ScrollView>

            {/* Emergency Button */}
            <View style={elderNotificationStyles.emergencyContainer}>
                <TouchableOpacity
                    style={elderNotificationStyles.emergencyButton}
                    activeOpacity={0.8}
                    onPress={() => console.log('Emergency pressed')} // Replace with navigation logic
                >
                    <Text style={elderNotificationStyles.emergencyText}>Emergency</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <TouchableOpacity
                    style={elderNotificationStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View style={elderNotificationStyles.filterModal}>
                        <Text style={elderNotificationStyles.filterModalTitle}>Filter by:</Text>

                        {['Message', 'Danger Alert', 'Warning Alert', 'Unread'].map(filter => (
                            <TouchableOpacity
                                key={filter}
                                style={elderNotificationStyles.filterOption}
                                onPress={() => toggleFilter(filter)}
                            >
                                <Text style={elderNotificationStyles.filterOptionText}>{filter}</Text>
                                <View style={[
                                    elderNotificationStyles.checkbox,
                                    activeFilters.includes(filter) && elderNotificationStyles.checkboxActive
                                ]}>
                                    {activeFilters.includes(filter) && (
                                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={elderNotificationStyles.applyButton}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={elderNotificationStyles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

        </SafeAreaView>
    );
}