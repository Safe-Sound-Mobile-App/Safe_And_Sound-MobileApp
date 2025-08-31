import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  logoContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  // สำหรับใส่ไอคอนจริง
  logoIcon: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleContainer: {
    marginBottom: 5,
    height: 110,
  },
  titleMask: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  gradientTitle: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: 'transparent',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10, // เพิ่ม spacing ระหว่าง title และ button
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButton: {
    width: width * 0.35, // ใช้ 60% ของหน้าจอ
    maxWidth: 150,
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: '#000000',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    letterSpacing: 1,
    textAlign: 'center',
  },
});