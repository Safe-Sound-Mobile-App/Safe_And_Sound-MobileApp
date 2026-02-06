import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { profileStyles } from '../../../global_style/elderUseSection/elderProfileStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabParamList } from "../../../App";
import {elderHomeStyles as styles} from "../../../global_style/elderUseSection/elderHomeStyles";

// Import icons
const accountIcon = require('../../../../assets/icons/profile/account.png');
const cameraIcon = require('../../../../assets/icons/profile/camera.png');
const editIcon = require('../../../../assets/icons/profile/edit.png');
const caregiverIcon = require('../../../../assets/icons/profile/caregiver.png');
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
    caregiverCount: number;
    maxCaregivers: number;
    profileImage: any;
    backgroundImage: any;
}

export default function ElderProfile({ navigation }: Props) {
    const [profile, setProfile] = useState<UserProfile>({
        firstName: 'Fname',
        lastName: 'Lname',
        uid: '000000000',
        role: 'Elder',
        tel: '0812345678',
        caregiverCount: 3,
        maxCaregivers: 5,
        profileImage: null,
        backgroundImage: null,
    });

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
        navigation.navigate('elderEditProfile' as any, { profile });
    };

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
                    <Text style={profileStyles.uid}>UID: {profile.uid}</Text>

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
                                source={caregiverIcon}
                                style={profileStyles.infoIcon}
                                resizeMode="contain"
                            />
                            <Text style={profileStyles.infoLabel}>Caregiver Count:</Text>
                            <Text style={profileStyles.infoValue}>
                                {profile.caregiverCount}/{profile.maxCaregivers}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            {/* Emergency Button - Placed Outside ScrollView to float at bottom */}
            <View style={styles.emergencyContainer}>
                <TouchableOpacity
                    style={styles.emergencyButton}
                    activeOpacity={0.8}
                >
                    <Text style={styles.emergencyText}>Emergency</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}