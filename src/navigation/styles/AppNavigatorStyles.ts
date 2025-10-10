import { StyleSheet } from 'react-native';

export const navbarStyles = StyleSheet.create({
  navbarContainer: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  // Active indicator dot with gradient (positioned above the icon)
  activeIndicatorContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Icon container with circle background and shadow
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // Make it float above
    transform: [{ translateY: -8 }],
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#6b7280', // Gray for inactive
  },
  activeNavIcon: {
    tintColor: '#008080', // Teal for active
    width: 28,
    height: 28,
  },
});