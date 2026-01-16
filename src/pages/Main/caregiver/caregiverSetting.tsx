import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { caregiverSettingStyles } from '../../../global_style/caregiverUseSection/caregiverSettingStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

// Import icons
const accountManageIcon = require('../../../../assets/icons/setting/account_manage.png');
const privacyIcon = require('../../../../assets/icons/setting/privacy.png');
const accessibilityIcon = require('../../../../assets/icons/setting/accessibility.png');
const notificationIcon = require('../../../../assets/icons/setting/notification.png');

type Props = NativeStackScreenProps<RootStackParamList, "CaregiverSetting">;

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

export default function CaregiverSetting({ navigation }: Props) {
  const handleSettingPress = (option: SettingOption) => {
    // TODO: Implement navigation when routes are ready
    console.log(`Clicked: ${option.title}`);
    alert(`${option.title} feature coming soon!`);
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
      </ScrollView>

      {/* BottomNavbar is already handled by Tab Navigator - DO NOT add here */}
    </SafeAreaView>
  );
}