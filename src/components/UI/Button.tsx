import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../config/theme'; // ปรับเส้นทางให้ถูกต้อง

interface ButtonProps {
  title: string; // ข้อความที่จะแสดงบนปุ่ม
  onPress: () => void; // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม
  style?: ViewStyle; // สไตล์เพิ่มเติมสำหรับ View ของปุ่ม (ครอบคลุม TouchableOpacity)
  textStyle?: TextStyle; // สไตล์เพิ่มเติมสำหรับ Text บนปุ่ม
}

const Button: React.FC<ButtonProps> = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary, // สีพื้นหลังเริ่มต้นของปุ่มจาก theme
    paddingVertical: 12, // ระยะห่างด้านในแนวตั้ง
    paddingHorizontal: 20, // ระยะห่างด้านในแนวนอน
    borderRadius: 8, // ความโค้งมนของปุ่ม
    alignItems: 'center', // จัดข้อความกึ่งกลางตามแนวนอน
    justifyContent: 'center', // จัดข้อความกึ่งกลางตามแนวตั้ง
    // เพิ่มเงาให้ปุ่มดูมีมิติ
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Shadow สำหรับ Android
  },
  buttonText: {
    color: Colors.white, // สีข้อความบนปุ่ม
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
