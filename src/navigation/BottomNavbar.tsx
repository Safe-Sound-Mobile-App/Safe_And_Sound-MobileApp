import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { navbarStyles } from './styles/AppNavigatorStyles';

// Import icons
const homeIcon = require('../../assets/icons/navbar/home.png');
const notificationIcon = require('../../assets/icons/navbar/notification.png');
const accountIcon = require('../../assets/icons/navbar/account.png');
const settingsIcon = require('../../assets/icons/navbar/settings.png');

interface NavItem {
  name: string;
  icon: any;
  route: string;
  isImplemented: boolean;
}

const navItems: NavItem[] = [
  { name: 'Home', icon: homeIcon, route: 'CaregiverHomepage', isImplemented: true },
  { name: 'Notification', icon: notificationIcon, route: 'Notification', isImplemented: true },
  { name: 'Account', icon: accountIcon, route: 'Account', isImplemented: true },
  { name: 'Settings', icon: settingsIcon, route: 'CaregiverSetting', isImplemented: true },
];

export default function BottomNavbar({ state, navigation }: BottomTabBarProps) {
  // Animated value for sliding effect
  const slideAnim = useRef(new Animated.Value(state.index)).current;

  // Animate when active tab changes
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index,
      useNativeDriver: false, // Changed to false for better compatibility with position
      tension: 68,
      friction: 12,
    }).start();
  }, [state.index]);

  const handleNavigation = (item: NavItem, index: number) => {
    if (!item.isImplemented) {
      Alert.alert(
        'Coming Soon',
        `${item.name} page is under development.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const route = state.routes[index];
    const isFocused = state.index === index;

    if (!isFocused) {
      navigation.navigate(route.name);
    }
  };

  const isActive = (index: number) => {
    return state.index === index;
  };

  return (
    <View style={navbarStyles.navbarContainer}>
      <View style={navbarStyles.navbar}>
        {navItems.map((item, index) => {
          const active = isActive(index);
          
          // Animated scale for smooth transition
          const scaleAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
          const opacityAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

          useEffect(() => {
            Animated.parallel([
              Animated.spring(scaleAnim, {
                toValue: active ? 1 : 0,
                useNativeDriver: true,
                tension: 68,
                friction: 12,
              }),
              Animated.timing(opacityAnim, {
                toValue: active ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }, [active]);

          return (
            <TouchableOpacity
              key={index}
              style={navbarStyles.navButton}
              onPress={() => handleNavigation(item, index)}
              activeOpacity={0.7}
            >
              {/* Animated Gradient Dot - Above icon */}
              <Animated.View
                style={[
                  navbarStyles.dotContainer,
                  {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                  locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={navbarStyles.activeIndicatorDot}
                />
              </Animated.View>

              {/* Animated Circle Background - Behind icon */}
              <Animated.View
                style={[
                  navbarStyles.circleBackground,
                  {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              />

              {/* Icon - Always on top */}
              <View style={navbarStyles.iconContainer}>
                <Image
                  source={item.icon}
                  style={[
                    navbarStyles.navIcon,
                    active && navbarStyles.activeNavIcon,
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