// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // ตรวจสอบว่าได้ติดตั้ง react-native-vector-icons แล้ว

// Import หน้าจอต่างๆ สำหรับ Elder
import ElderHomePage from '../pages/Main/elder/HomePage';
import ElderNotificationsPage from '../pages/Main/elder/NotificationsPage';
import ElderProfilePage from '../pages/Main/elder/ProfilePage';
import ElderSettingsPage from '../pages/Main/elder/SettingsPage';

// Import Theme และ Styles
import { Colors } from '../config/theme';
import { appNavigatorStyles } from './styles/AppNavigator.styles';

// สามารถลบ console.log ที่ใช้ debug ออกได้ถ้าไม่ต้องการแล้ว
// console.log('Colors object in AppNavigator:', Colors);
// console.log('appNavigatorStyles object in AppNavigator:', appNavigatorStyles);

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  // สามารถลบ console.log ที่ใช้ debug ออกได้ถ้าไม่ต้องการแล้ว
  // console.log('ElderHomePage:', ElderHomePage);
  // console.log('ElderNotificationsPage:', ElderNotificationsPage);
  // console.log('ElderProfilePage:', ElderProfilePage);
  // console.log('ElderSettingsPage:', ElderSettingsPage);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({ // ตรงนี้รับแค่ { route }
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.grey,
          tabBarStyle: appNavigatorStyles.tabBarStyle,
          tabBarLabelStyle: appNavigatorStyles.tabBarLabelStyle,
          tabBarIcon: ({ focused, color, size }) => { // <--- 'focused', 'color', 'size' ต้องรับตรงนี้!
            let iconName: any; 
            // สามารถลบ console.log ที่ใช้ debug ออกได้ถ้าไม่ต้องการแล้ว
            // console.log('screenOptions route:', route.name);
            // console.log('tabBarStyle value:', appNavigatorStyles.tabBarStyle);
            // console.log('tabBarLabelStyle value:', appNavigatorStyles.tabBarLabelStyle);
            // console.log('iconName for', route.name, ':', iconName);

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Notifications') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            
            // ตรวจสอบว่า Ionicons ถูกโหลดมาแล้วหรือไม่
            if (!Ionicons) {
              console.error("Ionicons is not defined. Check react-native-vector-icons installation.");
              return null;
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={ElderHomePage} />
        <Tab.Screen name="Notifications" component={ElderNotificationsPage} />
        <Tab.Screen name="Profile" component={ElderProfilePage} />
        <Tab.Screen name="Settings" component={ElderSettingsPage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
