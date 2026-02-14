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
  
  // Gradient dot - positioned above icon
  dotContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Circle background - positioned behind icon, same level as icon
  circleBackground: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1, // Behind icon
  },
  
  // Icon container - always on top
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Above circle
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
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