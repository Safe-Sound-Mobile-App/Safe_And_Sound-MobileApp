import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ScrollView,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { caregiverHomeStyles, createCaregiverHomeStyles } from '../../../global_style/caregiverUseSection/caregiverHomeStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import auth from '@react-native-firebase/auth';
import { getCaregiverElders, getUserProfile, listenToEmergencyAlerts, resolveEmergencyAlert, EmergencyAlert } from '../../../services/firestore';

const chatIcon = require('../../../../assets/icons/chat.png');
const addIcon = require('../../../../assets/icons/plus.png');
const diamondIcon = require('../../../../assets/icons/alert/diamond-exclamation.png');
const hexagonIcon = require('../../../../assets/icons/alert/hexagon-exclamation.png');
const triangleIcon = require('../../../../assets/icons/alert/triangle-exclamation.png');
const rightIcon = require('../../../../assets/icons/direction/right.png');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mock Elder Data Interface
interface ElderData {
  id: string;
  name: string;
  image: any; // require() type
  risk: 'Normal' | 'Warning' | 'Danger';
  gyroscope: string;
  heartRate: number;
  spO2: number;
}

// Mock Data - Replace with API calls
const mockElderData: ElderData[] = [
  {
    id: '1',
    name: 'Elder1',
    image: require('../../../../assets/icons/elder.png'), // You'll need to add these images
    risk: 'Danger',
    gyroscope: 'Normal',
    heartRate: 120,
    spO2: 80,
  },
  {
    id: '2',
    name: 'Elder2',
    image: require('../../../../assets/icons/elder.png'),
    risk: 'Warning',
    gyroscope: 'Fell',
    heartRate: 55,
    spO2: 99,
  },
  {
    id: '3',
    name: 'Elder3',
    image: require('../../../../assets/icons/elder.png'),
    risk: 'Normal',
    gyroscope: 'Normal',
    heartRate: 70,
    spO2: 99,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "CaregiverHomepage">;

export default function CaregiverHomepage({ navigation }: Props) {
  const [elderData, setElderData] = useState<ElderData[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  
  // Animation values for each card
  const animationRefs = useRef<{[key: string]: Animated.Value}>({});
  
  // Fetch elders data from Firestore
  const fetchElders = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No authenticated user found');
        setLoading(false);
        return;
      }

      // Get elders that this caregiver is caring for
      const eldersResult = await getCaregiverElders(currentUser.uid);
      
      if (eldersResult.success && eldersResult.data) {
        // Transform Elder data to ElderData format
        const transformedData: ElderData[] = await Promise.all(
          eldersResult.data.map(async (elder) => {
            // Get user info (firstName, lastName, photoURL)
            const userResult = await getUserProfile(elder.userId);
            const userName = userResult.success && userResult.data 
              ? `${userResult.data.firstName} ${userResult.data.lastName}`
              : 'Unknown';
            
            // Use photoURL if available, otherwise use default icon
            const profileImage = userResult.success && userResult.data?.photoURL
              ? { uri: userResult.data.photoURL }
              : require('../../../../assets/icons/elder.png');

            return {
              id: elder.userId,
              name: userName,
              image: profileImage,
              risk: elder.currentHealthStatus.risk,
              gyroscope: elder.currentHealthStatus.gyroscope,
              heartRate: elder.currentHealthStatus.heartRate,
              spO2: elder.currentHealthStatus.spO2,
            };
          })
        );

        setElderData(transformedData);
      } else {
        // No elders found or error
        setElderData([]);
      }
    } catch (error) {
      console.error('Error fetching elders:', error);
      Alert.alert('Error', 'Failed to load elder data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchElders();
    }, [fetchElders])
  );

  // Listen to emergency alerts
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribe = listenToEmergencyAlerts(
      currentUser.uid,
      (alerts) => {
        setEmergencyAlerts(alerts);
        
        // Show alert for new emergency
        if (alerts.length > 0) {
          const latestAlert = alerts[0];
          Alert.alert(
            '🚨 EMERGENCY ALERT!',
            `${latestAlert.elderName} needs immediate help!`,
            [
              {
                text: 'View Details',
                onPress: () => {
                  // Could navigate to elder's profile or call them
                  console.log('View emergency details');
                },
              },
              { text: 'OK', style: 'cancel' },
            ]
          );
        }
      },
      (error) => {
        console.error('Emergency alerts error:', error);
      }
    );

    return () => unsubscribe();
  }, []);
  
  // Initialize animation values
  useEffect(() => {
    elderData.forEach(elder => {
      if (!animationRefs.current[elder.id]) {
        // เริ่มต้นด้วยค่า 0 (หุบ)
        animationRefs.current[elder.id] = new Animated.Value(0);
      }
    });
  }, [elderData]);

  // Custom LayoutAnimation configuration
  const EXPAND_DURATION = 200; // เวลาขยาย (milliseconds)
  const COLLAPSE_DURATION = 200; // เวลาหุบ (ช้ากว่า)
  
  const getLayoutAnimation = (isExpanding: boolean) => ({
    duration: isExpanding ? EXPAND_DURATION : COLLAPSE_DURATION,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  });

  // Function to get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Danger': return '#ef4444'; // Red
      case 'Warning': return '#f59e0b'; // Yellow/Orange
      case 'Normal': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  };

  // Function to get card background color
  const getCardBackgroundColor = (risk: string) => {
    switch (risk) {
      case 'Danger': return '#fca5a5'; // Light red
      case 'Warning': return '#ffcf77'; // Light yellow
      case 'Normal': return '#ffffff'; // White
      default: return '#ffffff';
    }
  };

  // Function to get risk icon
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Danger': return triangleIcon;
      case 'Warning': return diamondIcon;
      case 'Normal': return null;
      default: return null;
    }
  };

  // Toggle card expansion with animation
  const toggleCardExpansion = (elderId: string) => {
    const newExpanded = new Set(expandedCards);
    const isExpanding = !newExpanded.has(elderId);
    
    if (newExpanded.has(elderId)) {
      newExpanded.delete(elderId);
    } else {
      newExpanded.add(elderId);
    }
    
    setExpandedCards(newExpanded);

    // Animate the expansion/collapse
    const animValue = animationRefs.current[elderId];
    if (animValue) {
      Animated.timing(animValue, {
        toValue: isExpanding ? 1 : 0,
        duration: isExpanding ? EXPAND_DURATION : COLLAPSE_DURATION,
        useNativeDriver: false,
      }).start();
    }
  };

  // Handle add new elder
  const handleAddNewElder = () => {
    console.log('Add new elder pressed');
    // Navigate to add elder screen
    // navigation.navigate('AddElder');
  };

  // Handle chat with elder
  const handleChatWithElder = (elderId: string, elderName: string) => {
    navigation.navigate('CaregiverChatPage', { elderId, elderName });
  };

  // Handle navigate to elder information
  const handleElderInfo = (elderId: string) => {
    console.log(`Navigating to elder info for ${elderId}`);
    // navigation.navigate('ElderInfo', { elderId });
  };

  // Render elder card with animation
  const renderElderCard = (elder: ElderData, index: number) => {
    const isExpanded = expandedCards.has(elder.id);
    const riskColor = getRiskColor(elder.risk);
    const cardBackgroundColor = getCardBackgroundColor(elder.risk);
    const riskIcon = getRiskIcon(elder.risk);
    
    // Get animation value for this card
    const animValue = animationRefs.current[elder.id] || new Animated.Value(0);
    
    // Calculate animated height and opacity
    const expandedHeight = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 120], // Adjust based on your content height
    });
    
    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <TouchableOpacity
        key={elder.id}
        style={[
          caregiverHomeStyles.elderCard,
          { backgroundColor: cardBackgroundColor }
        ]}
        onPress={() => toggleCardExpansion(elder.id)}
        activeOpacity={0.8}
      >
        {/* Header Section */}
        <View style={caregiverHomeStyles.cardHeader}>
          <Image 
            source={elder.image} 
            style={caregiverHomeStyles.elderImage}
            resizeMode="cover"
          />
          
          <View style={caregiverHomeStyles.elderInfo}>
            <View style={caregiverHomeStyles.elderNameRow}>
              <Text style={caregiverHomeStyles.elderName}>{elder.name}</Text>
              {riskIcon && (
                <Image 
                    source={riskIcon}
                    style={{ width: 14, height: 14, tintColor: riskColor}}
                    resizeMode="contain"
                />
              )}
            </View>
            <Text style={[caregiverHomeStyles.riskText, { color: riskColor }]}>
              Risk: {elder.risk}
            </Text>
          </View>

          <TouchableOpacity
            style={caregiverHomeStyles.chatButton}
            onPress={() => handleChatWithElder(elder.id, elder.name)}
          >
            <Image 
              source={chatIcon} 
              style={{ width: 26, height: 26, tintColor: '#374151' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Animated Expanded Body Section */}
        <Animated.View
          style={[
            {
              height: expandedHeight,
              opacity: opacity,
              overflow: 'hidden',
            }
          ]}
        >
          <View style={caregiverHomeStyles.cardBody}>
            <View style={caregiverHomeStyles.vitalSignsContainer}>
              <View style={caregiverHomeStyles.vitalRow}>
                <Text style={caregiverHomeStyles.vitalLabel}>Gyroscope:</Text>
                <View style={caregiverHomeStyles.vitalValueContainer}>
                  <Text style={caregiverHomeStyles.vitalValue}>{elder.gyroscope}</Text>
                  {elder.gyroscope !== 'Normal' && (
                    <Image 
                        source={hexagonIcon} 
                        style={{ width: 12, height: 12, tintColor: elder.gyroscope === 'Fell' ? '#f59e0b' : '#6b7280' }}
                        resizeMode="contain"
                    />
                  )}
                </View>
              </View>

              <View style={caregiverHomeStyles.vitalRow}>
                <Text style={caregiverHomeStyles.vitalLabel}>Heart Rate:</Text>
                <View style={caregiverHomeStyles.vitalValueContainer}>
                  <Text style={caregiverHomeStyles.vitalValue}>{elder.heartRate} Bpm</Text>
                  {(elder.heartRate > 100 || elder.heartRate < 60) && (
                    <Image 
                        source={hexagonIcon} 
                        style={{ width: 12, height: 12, tintColor: elder.heartRate > 100 ? '#ef4444' : '#f59e0b'}}
                        resizeMode="contain"
                    />
                  )}
                </View>
              </View>

              <View style={caregiverHomeStyles.vitalRow}>
                <Text style={caregiverHomeStyles.vitalLabel}>SpO2:</Text>
                <View style={caregiverHomeStyles.vitalValueContainer}>
                  <Text style={caregiverHomeStyles.vitalValue}>{elder.spO2}%</Text>
                  {elder.spO2 < 95 && (
                    <Image 
                        source={hexagonIcon} 
                        style={{ width: 12, height: 12, tintColor: "#ef4444" }}
                        resizeMode="contain"
                    />
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={caregiverHomeStyles.nextButton}
              onPress={() => navigation.navigate('caregiverElderInfo', { elderId: elder.id})}
            >
              <Image 
                source={rightIcon} 
                style={{ width: 14, height: 14, tintColor: '#374151' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={caregiverHomeStyles.container}>
      {/* Header */}
      <GradientHeader />

      <ScrollView 
        style={caregiverHomeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Alert Banner */}
        {emergencyAlerts.length > 0 && (
          <View style={{
            backgroundColor: '#ef4444',
            padding: 16,
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons name="warning" size={24} color="#fff" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                🚨 EMERGENCY ALERT!
              </Text>
              {emergencyAlerts.map((alert) => (
                <Text key={alert.id} style={{ color: '#fff', fontSize: 14 }}>
                  {alert.elderName} needs immediate help!
                </Text>
              ))}
            </View>
            <TouchableOpacity
              onPress={async () => {
                // Resolve all alerts
                for (const alert of emergencyAlerts) {
                  await resolveEmergencyAlert(alert.id);
                }
              }}
              style={{
                backgroundColor: '#fff',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 13 }}>
                Resolve
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Your Elder Section */}
        <View style={caregiverHomeStyles.sectionHeader}>
          <Text style={caregiverHomeStyles.sectionTitle}>Your Elder</Text>
          
          <TouchableOpacity
            style={caregiverHomeStyles.addButton}
            onPress={() => navigation.navigate('AddNewElder')} // Navigate to AddNewElder screen
          >
            <Image 
              source={addIcon} 
              style={{ width: 16, height: 16, tintColor: '#ffffff' }}
              resizeMode="contain"
            />
            <Text style={caregiverHomeStyles.addButtonText}>Add new elder</Text>
          </TouchableOpacity>
        </View>

        {/* Elder Count */}
        <View style={caregiverHomeStyles.elderCountContainer}>
          <Text style={caregiverHomeStyles.elderCount}>
            {elderData.length}/5
          </Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
              Loading elders...
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && elderData.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
              No elders yet
            </Text>
            <Text style={{ marginTop: 8, color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
              Add an elder to start monitoring their health
            </Text>
          </View>
        )}

        {/* Elder Cards */}
        {!loading && elderData.length > 0 && (
          <View style={caregiverHomeStyles.cardsContainer}>
            {elderData.map((elder, index) => renderElderCard(elder, index))}
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}