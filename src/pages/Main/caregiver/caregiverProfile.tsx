import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from '../../../global_style/caregiverUseSection/caregiverProfileStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabParamList } from "../../../App";
import auth from '@react-native-firebase/auth';
import { getUserProfile, getCaregiverElders } from '../../../services/firestore';
import * as Clipboard from 'expo-clipboard';

// Import icons
const accountIcon = require('../../../../assets/icons/profile/account.png');
const cameraIcon = require('../../../../assets/icons/profile/camera.png');
const editIcon = require('../../../../assets/icons/profile/edit.png');
const elderIcon = require('../../../../assets/icons/profile/elder.png');
const nameIcon = require('../../../../assets/icons/profile/name.png');
const telIcon = require('../../../../assets/icons/profile/tel.png');

type CombinedNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Account'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: CombinedNavigationProp;
};

interface UserProfile {
  firstName: string;
  lastName: string;
  uid: string;
  role: string;
  tel: string;
  elderCount: number;
  maxElders: number;
  profileImage: any;
  backgroundImage: any;
}

export default function CaregiverProfile({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No authenticated user');
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const userResult = await getUserProfile(currentUser.uid);
        if (!userResult.success || !userResult.data) {
          Alert.alert('Error', userResult.error || 'Failed to load profile');
          setLoading(false);
          return;
        }

        // Fetch elder count
        const eldersResult = await getCaregiverElders(currentUser.uid);
        const elderCount = eldersResult.success && eldersResult.data ? eldersResult.data.length : 0;

        setProfile({
          firstName: userResult.data.firstName,
          lastName: userResult.data.lastName,
          uid: currentUser.uid,
          role: 'Caregiver',
          tel: userResult.data.tel || 'N/A',
          elderCount: elderCount,
          maxElders: 5,
          profileImage: null,
          backgroundImage: null,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle profile image upload
  const handleProfileImageUpload = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => console.log('Take photo') },
        { text: 'Choose from Gallery', onPress: () => console.log('Choose from gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    // TODO: Implement image picker
    // const result = await ImagePicker.launchImageLibraryAsync({...});
  };

  // Handle background image upload
  const handleBackgroundImageUpload = () => {
    Alert.alert(
      'Change Background Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => console.log('Take photo') },
        { text: 'Choose from Gallery', onPress: () => console.log('Choose from gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    // TODO: Implement image picker
  };

  // Handle edit profile
  const handleEditProfile = () => {
    navigation.navigate('caregiverEditProfile' as any, { profile });
  };

  // Copy UID to clipboard
  const handleCopyUid = async () => {
    if (profile?.uid) {
      await Clipboard.setStringAsync(profile.uid);
      Alert.alert('Copied!', 'UID copied to clipboard');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={profileStyles.container}>
        <GradientHeader title="Safe & Sound" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={profileStyles.container}>
        <GradientHeader title="Safe & Sound" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={profileStyles.container}>
      <GradientHeader title="Safe & Sound" />

      <ScrollView
        style={profileStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Image Section */}
        <View style={profileStyles.backgroundContainer}>
          <TouchableOpacity
            style={profileStyles.backgroundImageWrapper}
            onPress={handleBackgroundImageUpload}
            activeOpacity={0.8}
          >
            {profile.backgroundImage ? (
              <Image
                source={profile.backgroundImage}
                style={profileStyles.backgroundImage}
                resizeMode="cover"
              />
            ) : (
              <View style={profileStyles.backgroundPlaceholder} />
            )}
            
            {/* Camera Icon for Background */}
            <View style={profileStyles.backgroundCameraButton}>
              <Image
                source={cameraIcon}
                style={profileStyles.cameraIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          {/* Profile Picture */}
          <View style={profileStyles.profileImageContainer}>
            <LinearGradient
              colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
              locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={profileStyles.profileImageGradientBorder}
            >
              <TouchableOpacity
                style={profileStyles.profileImageWrapper}
                onPress={handleProfileImageUpload}
                activeOpacity={0.8}
              >
                {profile.profileImage ? (
                  <Image
                    source={profile.profileImage}
                    style={profileStyles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={profileStyles.profileImagePlaceholder}>
                    <Image
                      source={cameraIcon}
                      style={profileStyles.profileCameraIcon}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Edit Button */}
            <TouchableOpacity
              style={profileStyles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Image
                source={editIcon}
                style={profileStyles.editIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Information */}
        <View style={profileStyles.infoContainer}>
          {/* Name */}
          <Text style={profileStyles.fullName}>
            {profile.firstName} {profile.lastName}
          </Text>

          {/* UID Card */}
          <View style={{
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            padding: 14,
            marginTop: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}>
            <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: '500' }}>Your UID</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'monospace', flex: 1 }} numberOfLines={1}>
                {profile.uid}
              </Text>
              <TouchableOpacity
                onPress={handleCopyUid}
                style={{
                  padding: 8,
                  backgroundColor: '#008080',
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Ionicons name="copy-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Items */}
          <View style={profileStyles.infoList}>
            {/* Role */}
            <View style={profileStyles.infoItem}>
              <Image
                source={accountIcon}
                style={profileStyles.infoIcon}
                resizeMode="contain"
              />
              <Text style={profileStyles.infoLabel}>Role:</Text>
              <Text style={profileStyles.infoValue}>{profile.role}</Text>
            </View>

            {/* Tel */}
            <View style={profileStyles.infoItem}>
              <Image
                source={telIcon}
                style={profileStyles.infoIcon}
                resizeMode="contain"
              />
              <Text style={profileStyles.infoLabel}>Tel:</Text>
              <Text style={profileStyles.infoValue}>{profile.tel}</Text>
            </View>

            {/* Elder Count */}
            <View style={profileStyles.infoItem}>
              <Image
                source={elderIcon}
                style={profileStyles.infoIcon}
                resizeMode="contain"
              />
              <Text style={profileStyles.infoLabel}>Elder Count:</Text>
              <Text style={profileStyles.infoValue}>
                {profile.elderCount}/{profile.maxElders}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}