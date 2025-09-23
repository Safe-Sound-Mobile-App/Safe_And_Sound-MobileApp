import React, { useState, useEffect, useRef } from 'react';
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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { caregiverHomeStyles, createCaregiverHomeStyles } from '../../../global_style/caregiverUseSection/caregiverHomeStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

const chatIcon = require('../../../../assets/icons/chat.png');

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
  const [elderData, setElderData] = useState<ElderData[]>(mockElderData);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Animation values for each card
  const animationRefs = useRef<{[key: string]: Animated.Value}>({});
  
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
      case 'Warning': return '#fcd34d'; // Light yellow
      case 'Normal': return '#ffffff'; // White
      default: return '#ffffff';
    }
  };

  // Function to get risk icon
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Danger': return 'warning';
      case 'Warning': return 'alert-circle';
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
    console.log(`Opening chat with ${elderName} (ID: ${elderId})`);
    // Navigate to chat screen
    // navigation.navigate('Chat', { elderId, elderName });
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
                <Ionicons 
                  name={riskIcon as any} 
                  size={16} 
                  color={riskColor} 
                  style={caregiverHomeStyles.riskIcon}
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
              style={{ width: 30, height: 30, tintColor: '#374151' }}
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
                    <Ionicons 
                      name="alert-circle" 
                      size={14} 
                      color={elder.gyroscope === 'Fell' ? '#f59e0b' : '#6b7280'} 
                    />
                  )}
                </View>
              </View>

              <View style={caregiverHomeStyles.vitalRow}>
                <Text style={caregiverHomeStyles.vitalLabel}>Heart Rate:</Text>
                <View style={caregiverHomeStyles.vitalValueContainer}>
                  <Text style={caregiverHomeStyles.vitalValue}>{elder.heartRate} Bpm</Text>
                  {(elder.heartRate > 100 || elder.heartRate < 60) && (
                    <Ionicons 
                      name="alert-circle" 
                      size={14} 
                      color={elder.heartRate > 100 ? '#ef4444' : '#f59e0b'} 
                    />
                  )}
                </View>
              </View>

              <View style={caregiverHomeStyles.vitalRow}>
                <Text style={caregiverHomeStyles.vitalLabel}>SpO2:</Text>
                <View style={caregiverHomeStyles.vitalValueContainer}>
                  <Text style={caregiverHomeStyles.vitalValue}>{elder.spO2}%</Text>
                  {elder.spO2 < 95 && (
                    <Ionicons 
                      name="alert-circle" 
                      size={14} 
                      color="#ef4444" 
                    />
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={caregiverHomeStyles.nextButton}
              onPress={() => handleElderInfo(elder.id)}
            >
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={caregiverHomeStyles.container}>
      {/* Header */}
      <View style={caregiverHomeStyles.header}>
        <Text style={caregiverHomeStyles.appTitle}>Safe & Sound</Text>
      </View>

      <ScrollView 
        style={caregiverHomeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Your Elder Section */}
        <View style={caregiverHomeStyles.sectionHeader}>
          <Text style={caregiverHomeStyles.sectionTitle}>Your Elder</Text>
          
          <TouchableOpacity
            style={caregiverHomeStyles.addButton}
            onPress={handleAddNewElder}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={caregiverHomeStyles.addButtonText}>Add new elder</Text>
          </TouchableOpacity>
        </View>

        {/* Elder Count */}
        <View style={caregiverHomeStyles.elderCountContainer}>
          <Text style={caregiverHomeStyles.elderCount}>
            {elderData.length}/5
          </Text>
        </View>

        {/* Elder Cards */}
        <View style={caregiverHomeStyles.cardsContainer}>
          {elderData.map((elder, index) => renderElderCard(elder, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}