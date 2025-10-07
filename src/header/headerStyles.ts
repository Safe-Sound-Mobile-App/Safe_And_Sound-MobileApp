import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const headerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 90,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  appTitle: {
    // fontSize: baseFontSizes.appTitle, // Will be scaled by context
    fontSize: 30,
    fontWeight: '900',
    fontFamily: 'BalooBhaijaan2_600SemiBold',
    color: '#008080',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleContainer: {
    height: 30,
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
});