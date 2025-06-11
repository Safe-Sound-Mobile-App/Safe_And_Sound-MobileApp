// src/pages/Main/elder/notification/ActivitiesNotificationTab.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native'; // ลบ StyleSheet ออก
import { Ionicons } from '@expo/vector-icons';
// ไม่จำเป็นต้อง import Colors ตรงๆ แล้ว เพราะ styles จะนำมาจากไฟล์ styles
// import { Colors } from '../../../config/theme';

// Import styles จากไฟล์สไตล์ใหม่ที่รวบรวมไว้
import { notificationPageStyles } from '../../styles/Notification.styles'; // ปรับเส้นทาง
import { Colors } from '../../../../config/theme'; // ยังคงต้องการ Colors เพื่อใช้ใน dropdown icon

interface ActivitiesNotificationTabProps {
  // หากมี props ที่ส่งมาจาก Navigator สามารถกำหนดตรงนี้ได้
}

const ActivitiesNotificationTab: React.FC<ActivitiesNotificationTabProps> = () => {
  const notifications = [
    { id: '1', type: 'message', text: "Caregiver1 - I'm arrived.", date: '23/3/2025 - 20:02' },
    { id: '2', type: 'danger', text: 'Heart Rate Drop', date: '23/3/2025 - 20:00' },
    { id: '3', type: 'warning', text: 'Heart Rate Drop', date: '23/3/2025 - 19:58' },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <Ionicons name="warning" size={24} color={Colors.white} style={notificationPageStyles.alertIcon} />;
      case 'warning':
        return <Ionicons name="warning-outline" size={24} color={Colors.white} style={notificationPageStyles.alertIcon} />;
      default:
        return null;
    }
  };

  return (
    <View style={notificationPageStyles.activitiesNotificationTabContainer}>
      <View style={notificationPageStyles.sortContainer}>
        <Text style={notificationPageStyles.sortText}>Sort by:</Text>
        <TouchableOpacity onPress={() => console.log('Sort by pressed')}>
          <Text style={notificationPageStyles.sortDropdown}>None <Ionicons name="chevron-down-outline" size={12} color={Colors.primary} /></Text>
        </TouchableOpacity>
      </View>

      {notifications.map((notification) => {
        if (notification.type === 'message') {
          return (
            <View key={notification.id} style={notificationPageStyles.notificationCard}>
              <Ionicons name="chatbox-outline" size={24} color={notificationPageStyles.textPrimary} /> {/* ควรใช้ color จาก theme โดยตรง */}
              <View style={notificationPageStyles.notificationContent}>
                <View style={notificationPageStyles.notificationHeader}>
                  <Text style={notificationPageStyles.messageText}>{notification.text}</Text>
                  <Text style={notificationPageStyles.dateText}>{notification.date}</Text>
                </View>
              </View>
            </View>
          );
        } else if (notification.type === 'danger') {
          return (
            <View key={notification.id} style={[notificationPageStyles.alertCard, notificationPageStyles.dangerAlertCard]}>
              {getAlertIcon(notification.type)}
              <Text style={notificationPageStyles.alertText}>{notification.text}</Text>
              <Text style={notificationPageStyles.dateText}>{notification.date}</Text>
              <View style={notificationPageStyles.dotIndicator} />
            </View>
          );
        } else if (notification.type === 'warning') {
          return (
            <View key={notification.id} style={[notificationPageStyles.alertCard, notificationPageStyles.warningAlertCard]}>
              {getAlertIcon(notification.type)}
              <Text style={notificationPageStyles.alertText}>{notification.text}</Text>
              <Text style={notificationPageStyles.dateText}>{notification.date}</Text>
              <View style={notificationPageStyles.dotIndicator} />
            </View>
          );
        }
        return null;
      })}
    </View>
  );
};

export default ActivitiesNotificationTab;
