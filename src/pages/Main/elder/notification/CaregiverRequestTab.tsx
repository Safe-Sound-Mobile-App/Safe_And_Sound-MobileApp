// src/pages/Main/elder/notification/CaregiverRequestTab.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native'; // ลบ StyleSheet ออก
import { Ionicons } from '@expo/vector-icons';
// ไม่จำเป็นต้อง import Colors ตรงๆ แล้ว เพราะ styles จะนำมาจากไฟล์ styles
// import { Colors } from '../../../config/theme';

// Import styles จากไฟล์สไตล์ใหม่ที่รวบรวมไว้
import { notificationPageStyles } from '../../styles/Notification.styles'; // ปรับเส้นทาง

interface CaregiverRequestTabProps {
  // หากมี props ที่ส่งมาจาก Navigator สามารถกำหนดตรงนี้ได้
}

const CaregiverRequestTab: React.FC<CaregiverRequestTabProps> = () => {
  const requests = [
    { id: '1', name: 'Caregiver4' },
    { id: '2', name: 'Caregiver5' },
  ];

  const handleApprove = (id: string) => {
    console.log(`อนุมัติคำขอ ${id}`);
    // เพิ่ม logic ในการส่งคำขออนุมัติไปยัง API
  };

  const handleReject = (id: string) => {
    console.log(`ปฏิเสธคำขอ ${id}`);
    // เพิ่ม logic ในการส่งคำขอปฏิเสธไปยัง API
  };

  return (
    <View style={notificationPageStyles.caregiverRequestTabContainer}>
      {requests.map((request) => (
        <View key={request.id} style={notificationPageStyles.caregiverRequestCard}>
          <View style={notificationPageStyles.caregiverAvatarPlaceholder} />
          <Text style={notificationPageStyles.caregiverName}>{request.name}</Text>
          <TouchableOpacity 
            style={[notificationPageStyles.iconButton, notificationPageStyles.approveButton]} 
            onPress={() => handleApprove(request.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color={notificationPageStyles.tabLabelActive.color} /> {/* ใช้สีขาวจาก theme */}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[notificationPageStyles.iconButton, notificationPageStyles.rejectButton]} 
            onPress={() => handleReject(request.id)}
          >
            <Ionicons name="close-circle-outline" size={24} color={notificationPageStyles.tabLabelActive.color} /> {/* ใช้สีขาวจาก theme */}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default CaregiverRequestTab;
