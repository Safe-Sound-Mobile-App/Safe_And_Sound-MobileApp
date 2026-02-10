import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { caregiverSettingStyles } from '../../../global_style/elderUseSection/elderSettingStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { signOut } from '../../../services/auth';

// Import icons
const accountManageIcon = require('../../../../assets/icons/setting/account_manage.png');
const privacyIcon = require('../../../../assets/icons/setting/privacy.png');
const accessibilityIcon = require('../../../../assets/icons/setting/accessibility.png');
const notificationIcon = require('../../../../assets/icons/setting/notification.png');

type Props = NativeStackScreenProps<RootStackParamList, "ElderSetting">;

interface SettingOption {
    id: string;
    title: string;
    icon: any;
}

const settingOptions: SettingOption[] = [
    {
        id: '1',
        title: 'Account Manage',
        icon: accountManageIcon,
    },
    {
        id: '2',
        title: 'Privacy',
        icon: privacyIcon,
    },
    {
        id: '3',
        title: 'Accessibility',
        icon: accessibilityIcon,
    },
    {
        id: '4',
        title: 'Notification',
        icon: notificationIcon,
    },
];

export default function ElderSetting({ navigation }: Props) {
    const [signingOut, setSigningOut] = useState(false);

    const handleSettingPress = (option: SettingOption) => {
        // TODO: Implement navigation when routes are ready
        console.log(`Clicked: ${option.title}`);
        alert(`${option.title} feature coming soon!`);
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        setSigningOut(true);
                        try {
                            const result = await signOut();
                            if (result.success) {
                                // Navigation will be handled automatically by Auth State Listener in App.tsx
                                navigation.navigate('Home');
                            } else {
                                Alert.alert('Error', result.error || 'Failed to sign out');
                            }
                        } catch (error) {
                            console.error('Sign out error:', error);
                            Alert.alert('Error', 'An unexpected error occurred');
                        } finally {
                            setSigningOut(false);
                        }
                    },
                },
            ]
        );
    };

    const renderSettingItem = (option: SettingOption, index: number) => {
        const isLast = index === settingOptions.length - 1;

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    caregiverSettingStyles.settingItem,
                    isLast && caregiverSettingStyles.settingItemLast
                ]}
                onPress={() => handleSettingPress(option)}
                activeOpacity={0.7}
            >
                <View style={caregiverSettingStyles.settingItemContent}>
                    <Image
                        source={option.icon}
                        style={caregiverSettingStyles.settingIcon}
                        resizeMode="contain"
                    />
                    <Text style={caregiverSettingStyles.settingTitle}>{option.title}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={caregiverSettingStyles.container}>
            {/* Header */}
            <GradientHeader title="Safe & Sound" />

            <ScrollView
                style={caregiverSettingStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Text style={caregiverSettingStyles.pageTitle}>Setting</Text>

                {/* Settings Card */}
                <View style={caregiverSettingStyles.settingsCard}>
                    {settingOptions.map((option, index) => renderSettingItem(option, index))}
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#ef4444',
                        paddingVertical: 14,
                        borderRadius: 12,
                        marginHorizontal: 20,
                        marginTop: 24,
                        marginBottom: 40,
                        alignItems: 'center',
                        opacity: signingOut ? 0.6 : 1,
                    }}
                    onPress={handleSignOut}
                    disabled={signingOut}
                    activeOpacity={0.8}
                >
                    {signingOut ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                            Sign Out
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* BottomNavbar is already handled by Tab Navigator - DO NOT add here */}
        </SafeAreaView>
    );
}