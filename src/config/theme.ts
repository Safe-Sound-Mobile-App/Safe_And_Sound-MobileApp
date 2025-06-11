// src/config/theme.ts

export const Colors = {
  primary: '#1E90FF', // สีหลักของแอป
  secondary: '#FF6347', // สีรอง
  background: '#F0F2F5', // สีพื้นหลังของหน้าจอส่วนใหญ่
  white: '#FFFFFF', // สีขาว
  black: '#000000', // สีดำ
  grey: '#808080', // สีเทาสำหรับข้อความ/ไอคอนที่ไม่ใช้งาน
  greyLight: '#E0E0E0', // สีเทาอ่อน (สำหรับ placeholder, เส้นแบ่ง)
  textPrimary: '#333333', // สีข้อความหลัก
  textSecondary: '#666666', // สีข้อความรอง
  danger: '#DC3545', // สีแดง (สำหรับปุ่มฉุกเฉิน, สถานะออฟไลน์)
  success: '#28A745', // สีเขียว (สำหรับสถานะออนไลน์)
};

export const Typography = {
  fontFamily: {
    regular: 'System', // ใช้ System Font เป็นค่าเริ่มต้น
    medium: 'System',
    bold: 'System',
  },
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
    xLarge: 24,
  },
};

export const Theme = {
  Colors,
  Typography,
};