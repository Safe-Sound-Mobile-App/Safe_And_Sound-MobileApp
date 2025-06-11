import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../config/theme'; // ปรับเส้นทางให้ถูกต้อง

interface CardProps {
  children: React.ReactNode; // เนื้อหาที่จะอยู่ใน Card
  style?: ViewStyle; // สไตล์เพิ่มเติมสำหรับ View ของ Card
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white, // สีพื้นหลังของ Card
    borderRadius: 8, // ความโค้งมนของขอบ Card
    padding: 15, // ระยะห่างด้านในของ Card
    // เพิ่มเงาให้ Card ดูมีมิติและลอยขึ้นมา
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // ความทึบของเงา
    shadowRadius: 4, // รัศมีของเงา
    elevation: 5, // Shadow สำหรับ Android
  },
});

export default Card;
