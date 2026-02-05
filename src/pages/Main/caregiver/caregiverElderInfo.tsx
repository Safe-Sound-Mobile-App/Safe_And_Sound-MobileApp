import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ScrollView,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import { caregiverElderInfoStyles } from '../../../global_style/caregiverUseSection/caregiverElderInfoStyles';

const chatIcon = require('../../../../assets/icons/chat.png');
const diamondIcon = require('../../../../assets/icons/alert/diamond-exclamation.png');
const hexagonIcon = require('../../../../assets/icons/alert/hexagon-exclamation.png');
const triangleIcon = require('../../../../assets/icons/alert/triangle-exclamation.png');
const copyIcon = require('../../../../assets/icons/copy.png');
const mapMarkerIcon = require('../../../../assets/icons/map-marker.png');

const screenWidth = Dimensions.get('window').width;

// Mock Elder Detail Data Interface
interface ElderDetailData {
  id: string;
  name: string;
  image: any;
  risk: 'Normal' | 'Warning' | 'Danger';
  gyroscope: string;
  heartRate: number;
  spO2: number;
  fullName: string;
  age: number;
  location: {
    latitude: number;
    longitude: number;
  };
  heartRateHistory: number[];
  spO2History: number[];
}

// Mock data - จะถูกแทนที่ด้วย API call
const mockElderDetailData: ElderDetailData = {
  id: '1',
  name: 'Elder1',
  image: require('../../../../assets/icons/elder.png'),
  risk: 'Danger',
  gyroscope: 'Normal',
  heartRate: 120,
  spO2: 80,
  fullName: 'Somchai Jaidee',
  age: 75,
  location: {
    latitude: 13.815656,
    longitude: 100.572576
  },
  heartRateHistory: [65, 70, 75, 80, 90, 100, 120],
  spO2History: [98, 97, 95, 92, 88, 85, 80]
};

type Props = NativeStackScreenProps<RootStackParamList, "ElderInformation">;

export default function CaregiverElderInfo({ navigation, route }: Props) {
  const { elderId } = route.params;
  const [elderData, setElderData] = useState<ElderDetailData>(mockElderDetailData);

  // Function to get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Danger': return '#ef4444';
      case 'Warning': return '#f59e0b';
      case 'Normal': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Function to get card background color
  const getCardBackgroundColor = (risk: string) => {
    switch (risk) {
      case 'Danger': return '#fca5a5';
      case 'Warning': return '#ffcf77';
      case 'Normal': return '#ffffff';
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

  // Copy coordinates to clipboard
  const copyCoordinates = () => {
    console.log('Coordinates copied:', `${elderData.location.latitude}, ${elderData.location.longitude}`);
    // Implement clipboard copy functionality
  };

  const riskColor = getRiskColor(elderData.risk);
  const cardBackgroundColor = getCardBackgroundColor(elderData.risk);
  const riskIcon = getRiskIcon(elderData.risk);

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ef4444',
    },
  };

  return (
    <SafeAreaView style={caregiverElderInfoStyles.container}>
      {/* Header */}
      <GradientHeader />

      <ScrollView 
        style={caregiverElderInfoStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Elder Card Header */}
        <View style={[
          caregiverElderInfoStyles.elderCard,
          { backgroundColor: cardBackgroundColor }
        ]}>
          <View style={caregiverElderInfoStyles.cardHeader}>
            <Image 
              source={elderData.image} 
              style={caregiverElderInfoStyles.elderImage}
              resizeMode="cover"
            />
            
            <View style={caregiverElderInfoStyles.elderInfo}>
              <View style={caregiverElderInfoStyles.elderNameRow}>
                <Text style={caregiverElderInfoStyles.elderName}>{elderData.name}</Text>
                {riskIcon && (
                  <Image 
                    source={riskIcon}
                    style={{ width: 14, height: 14, tintColor: riskColor }}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={[caregiverElderInfoStyles.riskText, { color: riskColor }]}>
                Risk: {elderData.risk}
              </Text>
            </View>

            <TouchableOpacity
              style={caregiverElderInfoStyles.chatButton}
              onPress={() => navigation.navigate('caregiverChat', { 
                elderId: elderData.id, 
                elderName: elderData.name 
              })}
            >
              <Image 
                source={chatIcon} 
                style={{ width: 26, height: 26, tintColor: '#374151' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vital Signs Section */}
        <View style={caregiverElderInfoStyles.vitalSignsCard}>
          <View style={caregiverElderInfoStyles.vitalItem}>
            <Text style={caregiverElderInfoStyles.vitalLabel}>Gyroscope Status:</Text>
            <View style={caregiverElderInfoStyles.vitalValueRow}>
              <Text style={caregiverElderInfoStyles.vitalValue}>{elderData.gyroscope}</Text>
              {elderData.gyroscope !== 'Normal' && (
                <Image 
                  source={hexagonIcon} 
                  style={{ width: 12, height: 12, tintColor: '#f59e0b', marginLeft: 6 }}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>

          {/* Heart Rate Chart */}
          <View style={caregiverElderInfoStyles.chartContainer}>
            <View style={caregiverElderInfoStyles.chartHeader}>
              <Text style={caregiverElderInfoStyles.chartLabel}>Heart Rate: {elderData.heartRate} Bpm</Text>
              {(elderData.heartRate > 100 || elderData.heartRate < 60) && (
                <Image 
                  source={hexagonIcon} 
                  style={{ width: 12, height: 12, tintColor: elderData.heartRate > 100 ? '#ef4444' : '#f59e0b' }}
                  resizeMode="contain"
                />
              )}
            </View>
            <LineChart
              data={{
                labels: [],
                datasets: [{
                  data: elderData.heartRateHistory
                }]
              }}
              width={screenWidth - 80}
              height={120}
              chartConfig={chartConfig}
              bezier
              style={caregiverElderInfoStyles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={false}
            />
          </View>

          {/* SpO2 Chart */}
          <View style={caregiverElderInfoStyles.chartContainer}>
            <View style={caregiverElderInfoStyles.chartHeader}>
              <Text style={caregiverElderInfoStyles.chartLabel}>SpO2: {elderData.spO2}%</Text>
              {elderData.spO2 < 95 && (
                <Image 
                  source={hexagonIcon} 
                  style={{ width: 12, height: 12, tintColor: '#ef4444' }}
                  resizeMode="contain"
                />
              )}
            </View>
            <LineChart
              data={{
                labels: [],
                datasets: [{
                  data: elderData.spO2History
                }]
              }}
              width={screenWidth - 80}
              height={120}
              chartConfig={chartConfig}
              bezier
              style={caregiverElderInfoStyles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={false}
            />
          </View>
        </View>

        {/* Elder Information Section */}
        <View style={caregiverElderInfoStyles.infoCard}>
          <Text style={caregiverElderInfoStyles.sectionTitle}>Elder Information</Text>
          
          <View style={caregiverElderInfoStyles.infoSection}>
            <Text style={caregiverElderInfoStyles.infoSubtitle}>General Information:</Text>
            <View style={caregiverElderInfoStyles.infoRow}>
              <Text style={caregiverElderInfoStyles.infoLabel}>Full Name:</Text>
              <Text style={caregiverElderInfoStyles.infoValue}>{elderData.fullName}</Text>
            </View>
            <View style={caregiverElderInfoStyles.infoRow}>
              <Text style={caregiverElderInfoStyles.infoLabel}>Age:</Text>
              <Text style={caregiverElderInfoStyles.infoValue}>{elderData.age}</Text>
            </View>
            <Text style={caregiverElderInfoStyles.infoLabel}>etc.</Text>
          </View>

          <View style={caregiverElderInfoStyles.infoSection}>
            <Text style={caregiverElderInfoStyles.infoSubtitle}>Location:</Text>
            <View style={caregiverElderInfoStyles.locationRow}>
              <Text style={caregiverElderInfoStyles.coordinatesText}>
                {elderData.location.latitude}, {elderData.location.longitude}
              </Text>
              <TouchableOpacity onPress={copyCoordinates}>
                <Image 
                  source={copyIcon} 
                  style={{ width: 16, height: 16, tintColor: '#374151' }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            
            {/* Map Placeholder */}
            <View style={caregiverElderInfoStyles.mapContainer}>
              <Image 
                source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${elderData.location.latitude},${elderData.location.longitude}&zoom=15&size=600x300&markers=color:red%7C${elderData.location.latitude},${elderData.location.longitude}&key=YOUR_API_KEY` }}
                style={caregiverElderInfoStyles.mapImage}
                resizeMode="cover"
              />
              <View style={caregiverElderInfoStyles.mapMarkerOverlay}>
                <Image 
                  source={mapMarkerIcon} 
                  style={{ width: 32, height: 32, tintColor: '#ef4444' }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}