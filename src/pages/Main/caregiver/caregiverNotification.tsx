import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { notificationStyles } from '../../../global_style/caregiverUseSection/caregiverNotificationStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabParamList } from "../../../App";

const notificationIcon = require('../../../../assets/icons/navbar/notification.png');
const triangleIcon = require('../../../../assets/icons/alert/triangle-exclamation.png');
const diamondIcon = require('../../../../assets/icons/alert/diamond-exclamation.png');

type CombinedNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Notification'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: CombinedNavigationProp;
};

// Notification Types
type NotificationType = 'elder_accept' | 'message' | 'danger' | 'warning';

interface ElderAcceptNotification {
  id: string;
  type: 'elder_accept';
  elderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface ActivityNotification {
  id: string;
  type: 'message' | 'danger' | 'warning';
  title: string;
  elderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

type Notification = ElderAcceptNotification | ActivityNotification;

// Mock Data
const mockElderAcceptNotifications: ElderAcceptNotification[] = [
  { id: '1', type: 'elder_accept', elderName: 'Elder Name', message: 'Accept your request', timestamp: '23/3/2025 - 20:02', isRead: false },
  { id: '2', type: 'elder_accept', elderName: 'Elder Name', message: 'Accept your request', timestamp: '23/3/2025 - 20:02', isRead: false },
];

const mockActivityNotifications: ActivityNotification[] = [
  { id: '3', type: 'message', title: 'Message', elderName: 'Elder1', message: 'Help Aw!', timestamp: '23/3/2025 - 20:02', isRead: false },
  { id: '4', type: 'danger', title: 'Danger Alert', elderName: 'Elder1', message: 'Heart Rate Spikes', timestamp: '23/3/2025 - 20:00', isRead: false },
  { id: '5', type: 'warning', title: 'Warning Alert', elderName: 'Elder2', message: 'Heart Rate Drop', timestamp: '23/3/2025 - 19:58', isRead: false },
];

export default function CaregiverNotification({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'elder_accept' | 'activities'>('elder_accept');
  const [elderAcceptNotifs, setElderAcceptNotifs] = useState(mockElderAcceptNotifications);
  const [activityNotifs, setActivityNotifs] = useState(mockActivityNotifications);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Get notification badge color
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'message': return '#ffffff';
      case 'danger': return '#fca5a5';
      case 'warning': return '#fcd34d';
      default: return '#ffffff';
    }
  };

  // Handle Elder Accept notification tap
  const handleElderAcceptTap = (notif: ElderAcceptNotification) => {
    // Mark as read
    setElderAcceptNotifs(prev =>
      prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
    );
    
    // Navigate to Elder Profile (mock)
    console.log('Navigate to Elder Profile:', notif.elderName);
    // navigation.navigate('ElderProfile', { elderId: notif.id });
  };

  // Handle Activity notification tap
  const handleActivityTap = (notif: ActivityNotification) => {
    // Mark as read
    setActivityNotifs(prev =>
      prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
    );

    // Navigate based on type
    if (notif.type === 'message') {
      console.log('Navigate to Chat:', notif.elderName);
      // navigation.navigate('Chat', { elderId: notif.id });
    } else {
      console.log('Navigate to Elder Information:', notif.elderName);
      // navigation.navigate('ElderInformation', { elderId: notif.id });
    }
  };

  // Filter logic
  const getFilteredNotifications = () => {
    if (activeFilters.length === 0) return activityNotifs;

    return activityNotifs.filter(notif => {
      if (activeFilters.includes('Unread') && !notif.isRead) return true;
      if (activeFilters.includes('Message') && notif.type === 'message') return true;
      if (activeFilters.includes('Danger Alert') && notif.type === 'danger') return true;
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

  // Render Elder Accept Badge
  const renderElderAcceptBadge = (notif: ElderAcceptNotification) => (
    <TouchableOpacity
      key={notif.id}
      style={notificationStyles.elderAcceptBadge}
      onPress={() => handleElderAcceptTap(notif)}
      activeOpacity={0.7}
    >
      {!notif.isRead && <View style={notificationStyles.unreadDot} />}
      
      <View style={notificationStyles.badgeContent}>
        <Text style={notificationStyles.elderAcceptTitle}>({notif.elderName})</Text>
        <Text style={notificationStyles.elderAcceptMessage}>{notif.message}</Text>
      </View>
      
      <Text style={notificationStyles.timestamp}>{notif.timestamp}</Text>
    </TouchableOpacity>
  );

  // Render Activity Badge
  const renderActivityBadge = (notif: ActivityNotification) => (
    <TouchableOpacity
      key={notif.id}
      style={[
        notificationStyles.activityBadge,
        { backgroundColor: getNotificationColor(notif.type) }
      ]}
      onPress={() => handleActivityTap(notif)}
      activeOpacity={0.7}
    >
      {!notif.isRead && <View style={notificationStyles.unreadDot} />}
      
      <View style={notificationStyles.activityHeader}>
        <View style={notificationStyles.activityTitleRow}>
          <Text style={[
            notificationStyles.activityTitle,
            { color: notif.type === 'message' ? '#374151' : (notif.type === 'danger' ? '#dc2626' : '#d97706') }
          ]}>
            {notif.title}
          </Text>
          {notif.type !== 'message' && (
            <Image
              source={notif.type === 'danger' ? triangleIcon : diamondIcon}
              style={notificationStyles.alertIcon}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={notificationStyles.activityBadge}>{notif.timestamp}</Text>
      </View>
      
      <Text style={[
        notificationStyles.activityMessage,
        { color: notif.type === 'message' ? '#6b7280' : (notif.type === 'danger' ? '#7f1d1d' : '#78350f') }
      ]}>
        {notif.elderName} - {notif.message}
      </Text>
    </TouchableOpacity>
  );

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
            style={notificationStyles.tabButton}
            onPress={() => setActiveTab('elder_accept')}
            activeOpacity={0.7}
          >
            {activeTab === 'elder_accept' && (
              <LinearGradient
                colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={notificationStyles.tabActiveIndicator}
              />
            )}
            <Text style={[
              notificationStyles.tabText,
              activeTab === 'elder_accept' && notificationStyles.tabTextActive
            ]}>
              Elder Accept
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={notificationStyles.tabButton}
            onPress={() => setActiveTab('activities')}
            activeOpacity={0.7}
          >
            {activeTab === 'activities' && (
              <LinearGradient
                colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={notificationStyles.tabActiveIndicator}
              />
            )}
            <Text style={[
              notificationStyles.tabText,
              activeTab === 'activities' && notificationStyles.tabTextActive
            ]}>
              Activities Notification
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Button (only for Activities tab) */}
        {activeTab === 'activities' && (
          <View style={notificationStyles.filterContainer}>
            <TouchableOpacity
              style={notificationStyles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={16} color="#6b7280" />
              <Text style={notificationStyles.filterText}>
                Filter by: {activeFilters.length > 0 ? activeFilters.join(', ') : 'None'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <View style={notificationStyles.notificationsList}>
          {activeTab === 'elder_accept' ? (
            elderAcceptNotifs.map(notif => renderElderAcceptBadge(notif))
          ) : (
            getFilteredNotifications().map(notif => renderActivityBadge(notif))
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