import React from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { navbarStyles } from './styles/AppNavigatorStyles';
import { LinearGradient } from 'expo-linear-gradient';

// Import icons
const homeIcon = require('../../assets/icons/navbar/home.png');
const notificationIcon = require('../../assets/icons/navbar/notification.png');
const accountIcon = require('../../assets/icons/navbar/account.png');
const settingsIcon = require('../../assets/icons/navbar/settings.png');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NavItem {
  name: string;
  icon: any;
  route: keyof RootStackParamList | 'ComingSoon'; // Allow 'ComingSoon' for mockup
  isImplemented: boolean; // Track if route is implemented
}

const navItems: NavItem[] = [
  { name: 'Home', icon: homeIcon, route: 'CaregiverHomepage', isImplemented: true },
  { name: 'Notification', icon: notificationIcon, route: 'ComingSoon', isImplemented: false },
  { name: 'Account', icon: accountIcon, route: 'ComingSoon', isImplemented: false },
  { name: 'Settings', icon: settingsIcon, route: 'CaregiverSetting', isImplemented: true },
];

export default function BottomNavbar() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const handleNavigation = (item: NavItem) => {
    if (!item.isImplemented) {
      // Show alert for unimplemented routes
      Alert.alert(
        'Coming Soon',
        `${item.name} page is under development.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to implemented route
    if (item.route !== 'ComingSoon') {
      navigation.navigate(item.route);
    }
  };

  const isActive = (routeName: string) => {
    return route.name === routeName;
  };

  return (
    <View style={navbarStyles.navbarContainer}>
      <View style={navbarStyles.navbar}>
        {navItems.map((item, index) => {
          const active = isActive(item.route);
          
          return (
            <TouchableOpacity
              key={index}
              style={navbarStyles.navButton}
              onPress={() => handleNavigation(item)}
              activeOpacity={0.7}
            >
              {/* Active indicator dot with gradient - positioned above icon */}
              {active && (
                <View style={navbarStyles.activeIndicatorContainer}>
                  <LinearGradient
                    colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                    locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={navbarStyles.activeIndicatorDot}
                  />
                </View>
              )}
              
              {/* Icon with circle background and shadow when active */}
              <View style={[
                navbarStyles.iconContainer,
                active && navbarStyles.activeIconContainer
              ]}>
                <Image
                  source={item.icon}
                  style={[
                    navbarStyles.navIcon,
                    active && navbarStyles.activeNavIcon
                  ]}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}