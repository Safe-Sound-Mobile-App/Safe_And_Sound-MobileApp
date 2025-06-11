// src/pages/Main/elder/HomePage.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';

import { homePageStyles } from '../styles/HomePage.styles';

const ElderHomePage: React.FC = () => {
  const navigation = useNavigation();

  const caregivers = [
    { id: '1', name: 'Caregiver1', status: 'online', avatar: require('../../../../assets/images/user-placeholder.png') },
    { id: '2', name: 'Caregiver2', status: 'online', avatar: require('../../../../assets/images/user-placeholder.png') },
    { id: '3', name: 'Caregiver3', status: 'offline', avatar: require('../../../../assets/images/user-placeholder.png') },
  ];

  const handleEmergencyPress = () => {
    console.log('Emergency button pressed!');
  };

  const handleChatPress = (caregiverName: string) => {
    console.log(`Chat with ${caregiverName}`);
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? homePageStyles.statusOnline.backgroundColor : homePageStyles.statusOffline.backgroundColor;
  };

  return (
    <SafeAreaView style={homePageStyles.safeArea}>
      <ScrollView contentContainerStyle={homePageStyles.scrollViewContent}>
        {/* Top Header Bar */}
        <View style={homePageStyles.topHeaderBar}>
          <View style={homePageStyles.headerBackground}>
            <Text style={homePageStyles.headerText}>Safe & Sound</Text>
          </View>
        </View>

        {/* Your Caregiver Section Header */}
        <View style={homePageStyles.caregiverSectionHeader}>
          <Text style={homePageStyles.sectionTitle}>Your Caregiver</Text>
          <Text style={homePageStyles.caregiverCount}>3/5</Text>
        </View>

        {/* Caregiver List */}
        {caregivers.map((caregiver) => (
          <Card key={caregiver.id} style={homePageStyles.caregiverCard}>
            <View style={homePageStyles.avatarPlaceholder} />
            <View style={homePageStyles.caregiverInfo}>
              <Text style={homePageStyles.caregiverName}>{caregiver.name}</Text>
              <View style={homePageStyles.statusContainer}>
                <View style={[homePageStyles.statusDot, { backgroundColor: getStatusColor(caregiver.status) }]} />
                <Text style={homePageStyles.statusText}>Status: {caregiver.status === 'online' ? 'Online' : 'Offline'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleChatPress(caregiver.name)}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={homePageStyles.chatIcon.color} />
            </TouchableOpacity>
          </Card>
        ))}

        {/* Emergency Button */}
        <View style={homePageStyles.emergencyButtonContainer}>
          <Button
            title="Emergency"
            onPress={handleEmergencyPress}
            style={homePageStyles.emergencyButton}
            textStyle={homePageStyles.emergencyButtonText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ElderHomePage; // <--- ตรวจสอบให้แน่ใจว่ามีบรรทัดนี้