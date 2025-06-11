// src/navigation/styles/AppNavigator.styles.ts
import { StyleSheet } from 'react-native';
// ตรวจสอบเส้นทาง (path) นี้อย่างละเอียด: '../../config/theme'
// มันหมายถึงการขึ้นไป 2 ระดับจากโฟลเดอร์ปัจจุบัน (src/navigation/styles)
// เพื่อไปที่ src/ แล้วเข้า src/config/theme
import { Colors } from '../../config/theme'; 

export const appNavigatorStyles = StyleSheet.create({
  tabBarStyle: {
    height: 70,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontFamily: 'System', // ใช้ System Font เป็นค่าเริ่มต้น
  },
});

// สามารถเพิ่ม console.log เพื่อตรวจสอบค่าเมื่อไฟล์นี้ถูกโหลด
console.log('AppNavigator.styles.ts loaded. appNavigatorStyles:', appNavigatorStyles);
