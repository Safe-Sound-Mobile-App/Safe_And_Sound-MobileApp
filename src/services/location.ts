import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';
import { updateElderLocation } from './firestore';

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  message?: string;
}

/**
 * Request location permissions
 */
export const requestLocationPermissions = async (): Promise<LocationPermissionStatus> => {
  try {
    console.log('[Location] Checking if location services are enabled...');
    // Check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    console.log('[Location] Location services enabled:', servicesEnabled);
    
    if (!servicesEnabled) {
      console.log('[Location] Location services are disabled');
      return {
        granted: false,
        canAskAgain: true,
        message: 'Location services are disabled. Please enable them in your device settings.',
      };
    }

    console.log('[Location] Requesting foreground location permission...');
    // Request foreground location permission
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    console.log('[Location] Foreground permission status:', foregroundStatus);
    
    if (foregroundStatus !== 'granted') {
      console.log('[Location] Foreground permission not granted:', foregroundStatus);
      return {
        granted: false,
        canAskAgain: foregroundStatus === 'undetermined',
        message: 'Location permission is required to track your location for safety purposes.',
      };
    }

    console.log('[Location] Foreground permission granted!');
    
    // For Android, also request background location if needed
    if (Platform.OS === 'android') {
      console.log('[Location] Requesting background location permission (Android)...');
      try {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        console.log('[Location] Background permission status:', backgroundStatus);
        if (backgroundStatus !== 'granted') {
          // Background permission is optional, so we continue with foreground only
          console.log('[Location] Background location permission not granted, using foreground only');
        }
      } catch (bgError: any) {
        // Background permission might not be available or might fail
        console.log('[Location] Background permission request failed (this is OK):', bgError.message);
      }
    }

    return {
      granted: true,
      canAskAgain: false,
    };
  } catch (error: any) {
    console.error('[Location] Error requesting location permissions:', error);
    console.error('[Location] Error details:', error.message, error.stack);
    return {
      granted: false,
      canAskAgain: true,
      message: error.message || 'Failed to request location permissions',
    };
  }
};

/**
 * Check current location permission status
 */
export const checkLocationPermissions = async (): Promise<LocationPermissionStatus> => {
  try {
    console.log('[Location] Checking foreground permissions...');
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    console.log('[Location] Permission check result - status:', status, 'canAskAgain:', canAskAgain);
    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain !== false,
    };
  } catch (error: any) {
    console.error('[Location] Error checking permissions:', error);
    return {
      granted: false,
      canAskAgain: true,
      message: error.message || 'Failed to check location permissions',
    };
  }
};

/**
 * Get current location once
 */
export const getCurrentLocation = async (): Promise<{
  success: boolean;
  location?: { latitude: number; longitude: number; accuracy: number | null };
  error?: string;
}> => {
  try {
    const permissionStatus = await checkLocationPermissions();
    if (!permissionStatus.granted) {
      const requestResult = await requestLocationPermissions();
      if (!requestResult.granted) {
        return {
          success: false,
          error: requestResult.message || 'Location permission not granted',
        };
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
    });

    return {
      success: true,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      },
    };
  } catch (error: any) {
    console.error('Error getting current location:', error);
    return {
      success: false,
      error: error.message || 'Failed to get current location',
    };
  }
};

/**
 * Update elder's location to Firebase
 */
export const updateLocationToFirebase = async (
  elderId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const locationResult = await getCurrentLocation();
    if (!locationResult.success || !locationResult.location) {
      return {
        success: false,
        error: locationResult.error || 'Failed to get location',
      };
    }

    const updateResult = await updateElderLocation(
      elderId,
      locationResult.location.latitude,
      locationResult.location.longitude,
      locationResult.location.accuracy
    );

    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || 'Failed to update location to Firebase',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating location to Firebase:', error);
    return {
      success: false,
      error: error.message || 'Failed to update location',
    };
  }
};

/**
 * Start watching location and updating to Firebase periodically
 * Returns a function to stop watching
 */
export const startLocationTracking = (
  elderId: string,
  updateIntervalMs: number = 30000, // Default: 30 seconds
  onError?: (error: string) => void
): (() => void) => {
  let watchSubscription: Location.LocationSubscription | null = null;
  let updateInterval: NodeJS.Timeout | null = null;
  let isActive = true;

  const stopTracking = () => {
    isActive = false;
    if (watchSubscription) {
      watchSubscription.remove();
      watchSubscription = null;
    }
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  };

  (async () => {
    try {
      // Request permissions first
      const permissionStatus = await requestLocationPermissions();
      if (!permissionStatus.granted) {
        onError?.(permissionStatus.message || 'Location permission not granted');
        return stopTracking;
      }

      // Update location immediately
      await updateLocationToFirebase(elderId);

      // Set up periodic updates
      updateInterval = setInterval(async () => {
        if (!isActive) return;
        const result = await updateLocationToFirebase(elderId);
        if (!result.success && onError) {
          onError(result.error || 'Failed to update location');
        }
      }, updateIntervalMs);

      // Optionally watch location changes (for more accurate tracking)
      watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: updateIntervalMs,
          distanceInterval: 10, // Update if moved 10 meters
        },
        async (location) => {
          if (!isActive) return;
          try {
            await updateElderLocation(
              elderId,
              location.coords.latitude,
              location.coords.longitude,
              location.coords.accuracy
            );
          } catch (error: any) {
            console.error('Error updating location from watch:', error);
            onError?.(error.message || 'Failed to update location');
          }
        }
      );
    } catch (error: any) {
      console.error('Error starting location tracking:', error);
      onError?.(error.message || 'Failed to start location tracking');
    }
  })();

  return stopTracking;
};
