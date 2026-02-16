import React, { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { notificationStyles } from '../../../global_style/caregiverUseSection/caregiverNotificationStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabParamList } from "../../../App";
import auth from '@react-native-firebase/auth';
import {
  listenToNotifications,
  listenToCaregiverSentRequests,
  cancelCaregiverRequest,
  markNotificationAsRead,
  Notification,
  CaregiverSentRequest,
} from '../../../services/firestore';

const notificationIcon = require('../../../../assets/icons/navbar/notification.png');
const triangleIcon = require('../../../../assets/icons/alert/triangle-exclamation.png');
const diamondIcon = require('../../../../assets/icons/alert/diamond-exclamation.png');
const filterIcon = require('../../../../assets/icons/filter.png');
const downArrowIcon = require('../../../../assets/icons//direction/down.png');

type CombinedNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Notification'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: CombinedNavigationProp;
};

type NotificationRouteParams = { openActivities?: boolean };

const elderIcon = require('../../../../assets/icons/elder.png');

export default function CaregiverNotification({ navigation }: Props) {
  const route = useRoute<RouteProp<{ params: NotificationRouteParams }, 'params'>>();
  const [activeTab, setActiveTab] = useState<'elder_accept' | 'activities'>('elder_accept');

  // When navigated here after delete, open Activities tab so "Relationship Removed" is visible
  useEffect(() => {
    const openActivities = (route.params as NotificationRouteParams)?.openActivities;
    if (openActivities) setActiveTab('activities');
  }, [route.params]);
  const [sentRequests, setSentRequests] = useState<CaregiverSentRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingElderAccept, setLoadingElderAccept] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Elder Accept tab: always listen to sent requests (no index needed)
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'No authenticated user');
      setLoadingElderAccept(false);
      return;
    }

    const unsubSent = listenToCaregiverSentRequests(
      currentUser.uid,
      (requests) => {
        setSentRequests(requests);
        setLoadingElderAccept(false);
      },
      (error) => {
        console.error('Sent requests error:', error);
        setLoadingElderAccept(false);
      }
    );

    return () => unsubSent();
  }, []);

  // Activities tab: only subscribe when user opens that tab (uses notifications index)
  useEffect(() => {
    if (activeTab !== 'activities') return;

    const currentUser = auth().currentUser;
    if (!currentUser) {
      setLoadingActivities(false);
      return;
    }

    const unsubNotifs = listenToNotifications(
      currentUser.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoadingActivities(false);
      },
      (error) => {
        console.error('Notifications error:', error);
        setLoadingActivities(false);
        // Don't clear notifications on error – keep existing list so items (e.g. "relationship removed") don't disappear
      }
    );

    return () => unsubNotifs();
  }, [activeTab]);

  const activityNotifs = notifications.filter((n) => n.type !== 'elder_accept');

  // Get notification badge color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return '#ffffff';
      case 'danger': return '#fca5a5';
      case 'warning': return '#fcd34d';
      case 'emergency': return '#fca5a5';
      default: return '#ffffff';
    }
  };

  // Cancel a pending request (caregiver)
  const handleCancelRequest = (request: CaregiverSentRequest) => {
    if (request.status !== 'pending') return;
    Alert.alert(
      'Cancel request',
      `Cancel your request to ${request.elderName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelCaregiverRequest(request.id);
            if (result.success) {
              Alert.alert('Cancelled', 'Request has been cancelled.');
            } else {
              Alert.alert('Error', result.error || 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  // Handle Activity notification tap
  const handleActivityTap = async (notif: Notification) => {
    if (!notif.read) {
      // Update UI immediately so red dot disappears without waiting for listener
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      await markNotificationAsRead(notif.id);
    }

    // Navigate based on type
    if (notif.type === 'message' && notif.relatedId) {
      console.log('Navigate to Chat:', notif.relatedId);
      // navigation.navigate('CaregiverChatPage', { elderId: notif.relatedId, elderName: '...' });
    } else if (notif.type === 'emergency' && notif.relatedId) {
      console.log('Emergency alert:', notif.message);
    }
  };

  // Filter logic
  const getFilteredNotifications = () => {
    if (activeFilters.length === 0) return activityNotifs;

    return activityNotifs.filter(notif => {
      if (activeFilters.includes('Unread') && !notif.read) return true;
      if (activeFilters.includes('Message') && notif.type === 'message') return true;
      if (activeFilters.includes('Danger Alert') && (notif.type === 'danger' || notif.type === 'emergency')) return true;
      if (activeFilters.includes('Warning Alert') && notif.type === 'warning') return true;
      return false;
    });
  };

  // Toggle filter
  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Render Sent Request card (Elder Accept tab: pending + accepted)
  const renderSentRequestCard = (request: CaregiverSentRequest) => (
    <View key={request.id} style={notificationStyles.sentRequestCard}>
      <Image
        source={request.elderPhotoURL ? { uri: request.elderPhotoURL } : elderIcon}
        style={notificationStyles.sentRequestAvatar}
        resizeMode="cover"
      />
      <View style={notificationStyles.sentRequestInfo}>
        <Text style={notificationStyles.sentRequestName}>{request.elderName}</Text>
        <Text style={notificationStyles.sentRequestMeta}>
          {request.createdAt.toLocaleDateString()} {request.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={[notificationStyles.statusBadge, request.status === 'pending' ? notificationStyles.statusPending : notificationStyles.statusAccepted]}>
          <Text style={[notificationStyles.statusBadgeText, { color: request.status === 'pending' ? '#92400e' : '#065f46' }]}>
            {request.status === 'pending' ? 'Pending' : 'Accepted'}
          </Text>
        </View>
      </View>
      {request.status === 'pending' && (
        <TouchableOpacity
          style={notificationStyles.cancelRequestButton}
          onPress={() => handleCancelRequest(request)}
          activeOpacity={0.7}
        >
          <Text style={notificationStyles.cancelRequestButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render Activity Badge
  const renderActivityBadge = (notif: Notification) => {
    const isDanger = notif.type === 'danger' || notif.type === 'emergency';
    const isWarning = notif.type === 'warning';
    
    return (
      <TouchableOpacity
        key={notif.id}
        style={[
          notificationStyles.activityBadge,
          { backgroundColor: getNotificationColor(notif.type) }
        ]}
        onPress={() => handleActivityTap(notif)}
        activeOpacity={0.7}
      >
        {!notif.read && <View style={notificationStyles.unreadDot} />}
        
        <View style={notificationStyles.activityContent}>
          <View style={notificationStyles.activityTitleRow}>
            <Text style={[
              notificationStyles.activityTitle,
              { color: notif.type === 'message' ? '#374151' : (isDanger ? '#dc2626' : '#d97706') }
            ]}>
              {notif.title}
            </Text>
            {notif.type !== 'message' && (
              <Image
                source={isDanger ? triangleIcon : diamondIcon}
                style={notificationStyles.alertIcon}
                resizeMode="contain"
              />
            )}
          </View>
          
          <Text style={[
            notificationStyles.activityMessage,
            { color: notif.type === 'message' ? '#6b7280' : (isDanger ? '#7f1d1d' : '#78350f') }
          ]}>
            {notif.message}
          </Text>
        </View>
        
        <Text style={notificationStyles.activityTimestamp}>
          {notif.timestamp.toLocaleDateString()} - {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={notificationStyles.container}>
      <GradientHeader title="Safe & Sound" />

      <ScrollView
        style={notificationStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={notificationStyles.titleSection}>
          <Image
            source={notificationIcon}
            style={notificationStyles.titleIcon}
            resizeMode="contain"
          />
          <Text style={notificationStyles.title}>Notification</Text>
        </View>

        {/* Tab Buttons */}
        <View style={notificationStyles.tabContainer}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setActiveTab('elder_accept')}
            activeOpacity={0.7}
          >
            {activeTab === 'elder_accept' ? (
              <LinearGradient
                colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 25,
                  padding: 4,
                }}
              >
                <View style={[notificationStyles.tabButton, { backgroundColor: '#e5e7eb' }]}>
                  <Text style={[notificationStyles.tabText, notificationStyles.tabTextActive]}>
                    Elder Accept
                  </Text>
                </View>
              </LinearGradient>
            ) : (
              <View style={notificationStyles.tabButton}>
                <Text style={notificationStyles.tabText}>
                  Elder Accept
                </Text>
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
                style={{
                  borderRadius: 25,
                  padding: 4,
                }}
              >
                <View style={[notificationStyles.tabButton, { backgroundColor: '#e5e7eb' }]}>
                  <Text style={[notificationStyles.tabText, notificationStyles.tabTextActive]}>
                    Activities
                  </Text>
                </View>
              </LinearGradient>
            ) : (
              <View style={notificationStyles.tabButton}>
                <Text style={notificationStyles.tabText}>
                  Activities
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Button (only for Activities tab) */}
        {activeTab === 'activities' && (
          <View style={notificationStyles.filterContainer}>
            <TouchableOpacity
              style={notificationStyles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Image
                source={filterIcon}
                style={{ width: 16, height: 16, tintColor: "#6b7280" }}
                resizeMode="contain"
              />
              <Text style={notificationStyles.filterText}>
                Filter by: {activeFilters.length > 0 ? activeFilters.join(', ') : 'None'}
              </Text>
              <Image
                source={downArrowIcon}
                style={{ width: 14, height: 14, tintColor: "#6b7280" }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <View style={notificationStyles.notificationsList}>
          {activeTab === 'elder_accept' ? (
            loadingElderAccept ? (
              <ActivityIndicator size="large" color="#008080" style={{ marginTop: 40 }} />
            ) : sentRequests.length > 0 ? (
              sentRequests.map(renderSentRequestCard)
            ) : (
              <Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 20 }}>
                No sent requests. Add an elder from Home to see pending and accepted here.
              </Text>
            )
          ) : loadingActivities ? (
            <ActivityIndicator size="large" color="#008080" style={{ marginTop: 40 }} />
          ) : (
            getFilteredNotifications().length > 0 ? (
              getFilteredNotifications().map(notif => renderActivityBadge(notif))
            ) : (
              <Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 20 }}>
                No activity notifications
              </Text>
            )
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={notificationStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={notificationStyles.filterModal}>
            <Text style={notificationStyles.filterModalTitle}>Filter by:</Text>
            
            {['Message', 'Danger Alert', 'Warning Alert', 'Unread'].map(filter => (
              <TouchableOpacity
                key={filter}
                style={notificationStyles.filterOption}
                onPress={() => toggleFilter(filter)}
              >
                <Text style={notificationStyles.filterOptionText}>{filter}</Text>
                <View style={[
                  notificationStyles.checkbox,
                  activeFilters.includes(filter) && notificationStyles.checkboxActive
                ]}>
                  {activeFilters.includes(filter) && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={notificationStyles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={notificationStyles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}