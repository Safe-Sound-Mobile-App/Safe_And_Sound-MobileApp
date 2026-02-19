import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LineChart } from 'react-native-chart-kit';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import GradientHeader from '../../../header/GradientHeader';
import { caregiverElderInfoStyles } from '../../../global_style/caregiverUseSection/caregiverElderInfoStyles';
import firestore from '@react-native-firebase/firestore';
import { getElderById, getUserProfile, getHealthHistory, getLatestHealthData, listenToHealthData, HealthRecord } from '../../../services/firestore';

const chatIcon = require('../../../../assets/icons/chat.png');
const diamondIcon = require('../../../../assets/icons/alert/diamond-exclamation.png');
const hexagonIcon = require('../../../../assets/icons/alert/hexagon-exclamation.png');
const triangleIcon = require('../../../../assets/icons/alert/triangle-exclamation.png');
const copyIcon = require('../../../../assets/icons/copy.png');
const mapMarkerIcon = require('../../../../assets/icons/map-marker.png');
const defaultElderImage = require('../../../../assets/icons/elder.png');

const screenWidth = Dimensions.get('window').width;

export type ElderDetailData = {
  id: string;
  name: string;
  image: any;
  risk: 'Normal' | 'Warning' | 'Danger' | 'Not Wearing';
  gyroscope: string;
  heartRate: number;
  spO2: number;
  fullName: string;
  age: number;
  location: { latitude: number; longitude: number } | null;
  heartRateHistory: number[];
  spO2History: number[];
};

const defaultDetailData: ElderDetailData = {
  id: '',
  name: '',
  image: defaultElderImage,
  risk: 'Not Wearing',
  gyroscope: 'Normal',
  heartRate: 0,
  spO2: 0,
  fullName: '',
  age: 0,
  location: null,
  heartRateHistory: [],
  spO2History: [],
};

type Props = NativeStackScreenProps<RootStackParamList, "caregiverElderInfo">;

export default function CaregiverElderInfo({ navigation, route }: Props) {
  const { elderId } = route.params;
  const [elderData, setElderData] = useState<ElderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [elderRes, userRes, historyRes, healthDataRes] = await Promise.all([
          getElderById(elderId),
          getUserProfile(elderId),
          getHealthHistory(elderId, 7),
          getLatestHealthData(elderId),
        ]);
        if (cancelled) return;
        if (!elderRes.success || !elderRes.data) {
          setError(elderRes.error || 'Elder not found');
          setElderData(null);
          return;
        }
        const elder = elderRes.data;
        const user = userRes.success && userRes.data ? userRes.data : null;
        const fullName = user ? `${user.firstName} ${user.lastName}`.trim() || 'Unknown' : 'Unknown';
        const profileImage = user?.photoURL ? { uri: user.photoURL } : defaultElderImage;
        
        // Get health data from healthData collection
        const healthData = healthDataRes.success && healthDataRes.data 
          ? healthDataRes.data
          : {
              status: 'Not Wearing' as const,
              heartRate: 0,
              spO2: 0,
              gyroscope: 'Normal' as const,
            };
        
        const risk = healthData.status;
        const heartRate = healthData.heartRate;
        const spO2 = healthData.spO2;
        const gyroscope = healthData.gyroscope;
        const records = historyRes.success && historyRes.data ? historyRes.data : [];
        // Extract heartRate and spO2 from records (may be in sensorPayload.vitals)
        const heartRateHistory = records.length > 0
          ? records.map((r: any) => {
              // Check if data is in sensorPayload structure
              if (r.sensorPayload?.vitals?.heartRate !== undefined) {
                return Number(r.sensorPayload.vitals.heartRate) || 0;
              }
              // Fallback to direct heartRate field
              return Number(r.heartRate) || 0;
            })
          : [];
        const spO2History = records.length > 0
          ? records.map((r: any) => {
              // Check if data is in sensorPayload structure
              const vitals = r.sensorPayload?.vitals || {};
              if (vitals.spo2 !== undefined || vitals.spO2 !== undefined) {
                return Number(vitals.spo2 || vitals.spO2) || 0;
              }
              // Fallback to direct spO2 field
              return Number(r.spO2) || 0;
            })
          : [];
        const loc = elder.currentLocation;
        setElderData({
          id: elder.userId,
          name: fullName,
          image: profileImage,
          risk,
          gyroscope,
          heartRate,
          spO2,
          fullName,
          age: elder.age ?? 0,
          location: loc ? { latitude: loc.latitude, longitude: loc.longitude } : null,
          heartRateHistory: heartRateHistory.length >= 7 ? heartRateHistory.slice(-7) : heartRateHistory,
          spO2History: spO2History.length >= 7 ? spO2History.slice(-7) : spO2History,
        });
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Failed to load');
          setElderData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Set up real-time listener for health data
    const unsubscribeHealth = listenToHealthData(
      elderId,
      (healthData) => {
        if (!cancelled) {
          setElderData((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              risk: healthData.status,
              gyroscope: healthData.gyroscope,
              heartRate: healthData.heartRate,
              spO2: healthData.spO2,
            };
          });
        }
      },
      (error) => {
        console.error('Error listening to health data:', error);
      }
    );

    // Set up real-time listener for health history (for graphs)
    const unsubscribeHistory = firestore()
      .collection('healthData')
      .doc(elderId)
      .collection('records')
      .orderBy('recordedAt', 'desc')
      .limit(7)
      .onSnapshot(
        (snapshot) => {
          if (!cancelled) {
            const records = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as unknown as HealthRecord[];
            const reversedRecords = records.reverse();
            // Extract heartRate and spO2 from records (may be in sensorPayload.vitals)
            const heartRateHistory = reversedRecords.length > 0
              ? reversedRecords.map((r: any) => {
                  // Check if data is in sensorPayload structure
                  if (r.sensorPayload?.vitals?.heartRate !== undefined) {
                    return Number(r.sensorPayload.vitals.heartRate) || 0;
                  }
                  // Fallback to direct heartRate field
                  return Number(r.heartRate) || 0;
                }).slice(-7)
              : [];
            const spO2History = reversedRecords.length > 0
              ? reversedRecords.map((r: any) => {
                  // Check if data is in sensorPayload structure
                  const vitals = r.sensorPayload?.vitals || {};
                  if (vitals.spo2 !== undefined || vitals.spO2 !== undefined) {
                    return Number(vitals.spo2 || vitals.spO2) || 0;
                  }
                  // Fallback to direct spO2 field
                  return Number(r.spO2) || 0;
                }).slice(-7)
              : [];
            
            setElderData((prev) => {
              if (!prev) return null;
              // Ensure we have at least 2 points for chart (or use current values)
              const hrData = heartRateHistory.length >= 2 
                ? heartRateHistory 
                : heartRateHistory.length === 1 
                  ? [heartRateHistory[0], heartRateHistory[0]]
                  : [prev.heartRate, prev.heartRate];
              const spO2Data = spO2History.length >= 2 
                ? spO2History 
                : spO2History.length === 1 
                  ? [spO2History[0], spO2History[0]]
                  : [prev.spO2, prev.spO2];
              
              return {
                ...prev,
                heartRateHistory: hrData,
                spO2History: spO2Data,
              };
            });
          }
        },
        (error) => {
          console.error('Error listening to health history:', error);
        }
      );

    return () => {
      cancelled = true;
      unsubscribeHealth();
      unsubscribeHistory();
    };
  }, [elderId]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Danger': return '#ef4444';
      case 'Warning': return '#f59e0b';
      case 'Normal': return '#6b7280';
      case 'Not Wearing': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const getCardBackgroundColor = (risk: string) => {
    switch (risk) {
      case 'Danger': return '#fca5a5';
      case 'Warning': return '#ffcf77';
      case 'Normal': return '#ffffff';
      case 'Not Wearing': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Danger': return triangleIcon;
      case 'Warning': return diamondIcon;
      case 'Normal': return null;
      case 'Not Wearing': return null;
      default: return null;
    }
  };

  const copyCoordinates = async () => {
    if (!elderData?.location) return;
    const text = `${elderData.location.latitude}, ${elderData.location.longitude}`;
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Coordinates copied to clipboard');
  };

  const openInMaps = () => {
    if (!elderData?.location) return;
    const { latitude, longitude } = elderData.location;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open maps'));
  };

  if (loading) {
    return (
      <SafeAreaView style={caregiverElderInfoStyles.container}>
        <GradientHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={{ marginTop: 12, color: '#6b7280' }}>Loading elder information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !elderData) {
    return (
      <SafeAreaView style={caregiverElderInfoStyles.container}>
        <GradientHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ef4444', textAlign: 'center' }}>{error || 'Elder not found'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16, padding: 12, backgroundColor: '#008080', borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const riskColor = getRiskColor(elderData.risk);
  const cardBackgroundColor = getCardBackgroundColor(elderData.risk);
  const riskIcon = getRiskIcon(elderData.risk);

  const isNotWearing = elderData.risk === 'Not Wearing';

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#ef4444' },
  };

  const toValidChartData = (arr: number[], fallback: number[], safeDefault: number): number[] => {
    const valid = arr.map((n) => Number(n)).filter((n) => isFinite(n) && n >= 0);
    if (valid.length >= 2 && valid.some((n) => n > 0)) return valid;
    const fb = fallback.map((n) => Number(n)).filter((n) => isFinite(n) && n > 0);
    if (fb.length >= 2) return [fb[0], fb[1]];
    return [safeDefault, safeDefault];
  };
  const heartData = toValidChartData(elderData.heartRateHistory, [elderData.heartRate, elderData.heartRate], 60);
  const spO2Data = toValidChartData(elderData.spO2History, [elderData.spO2, elderData.spO2], 98);

  const ChartAxesOnly = ({ label }: { label: string }) => (
    <View style={caregiverElderInfoStyles.chartContainer}>
      <Text style={caregiverElderInfoStyles.chartLabel}>{label}</Text>
      <View style={[caregiverElderInfoStyles.chart, { height: 120, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, backgroundColor: '#e5e7eb' }} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: '#e5e7eb' }} />
        <Text style={{ color: '#9ca3af', fontSize: 12 }}>No data</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={caregiverElderInfoStyles.container}>
      <GradientHeader />
      <ScrollView
        style={caregiverElderInfoStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[caregiverElderInfoStyles.elderCard, { backgroundColor: cardBackgroundColor }]}>
          <View style={caregiverElderInfoStyles.cardHeader}>
            <Image source={elderData.image} style={caregiverElderInfoStyles.elderImage as any} resizeMode="cover" />
            <View style={caregiverElderInfoStyles.elderInfo}>
              <View style={caregiverElderInfoStyles.elderNameRow}>
                <Text style={caregiverElderInfoStyles.elderName}>{elderData.name}</Text>
                {riskIcon && (
                  <Image source={riskIcon} style={{ width: 14, height: 14, tintColor: riskColor }} resizeMode="contain" />
                )}
              </View>
              <Text style={[caregiverElderInfoStyles.riskText, { color: riskColor }]}>
                Risk: {elderData.risk}
              </Text>
            </View>
            <TouchableOpacity
              style={caregiverElderInfoStyles.chatButton}
              onPress={() => navigation.navigate('CaregiverChatPage', { elderId: elderData.id, elderName: elderData.name })}
            >
              <Image source={chatIcon} style={{ width: 26, height: 26, tintColor: '#374151' }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={caregiverElderInfoStyles.vitalSignsCard}>
          <View style={caregiverElderInfoStyles.vitalItem}>
            <Text style={caregiverElderInfoStyles.vitalLabel}>Gyroscope Status:</Text>
            <View style={caregiverElderInfoStyles.vitalValueRow}>
              <Text style={caregiverElderInfoStyles.vitalValue}>{isNotWearing ? '-' : elderData.gyroscope}</Text>
              {!isNotWearing && elderData.gyroscope !== 'Normal' && (
                <Image source={hexagonIcon} style={{ width: 12, height: 12, tintColor: '#f59e0b', marginLeft: 6 }} resizeMode="contain" />
              )}
            </View>
          </View>

          {isNotWearing ? (
            <>
              <ChartAxesOnly label="Heart Rate: -" />
              <ChartAxesOnly label="SpO2: -" />
            </>
          ) : (
            <>
              <View style={caregiverElderInfoStyles.chartContainer}>
                <View style={caregiverElderInfoStyles.chartHeader}>
                  <Text style={caregiverElderInfoStyles.chartLabel}>Heart Rate: {elderData.heartRate} Bpm</Text>
                  {(elderData.heartRate > 100 || elderData.heartRate < 60) && (
                    <Image source={hexagonIcon} style={{ width: 12, height: 12, tintColor: elderData.heartRate > 100 ? '#ef4444' : '#f59e0b' }} resizeMode="contain" />
                  )}
                </View>
                <LineChart
                  data={{ labels: [], datasets: [{ data: heartData }] }}
                  width={screenWidth - 80}
                  height={120}
                  chartConfig={chartConfig}
                  bezier
                  style={caregiverElderInfoStyles.chart}
                  withInnerLines withOuterLines withVerticalLines={false} withHorizontalLines withDots withShadow={false}
                />
              </View>
              <View style={caregiverElderInfoStyles.chartContainer}>
                <View style={caregiverElderInfoStyles.chartHeader}>
                  <Text style={caregiverElderInfoStyles.chartLabel}>SpO2: {elderData.spO2}%</Text>
                  {elderData.spO2 < 95 && elderData.spO2 > 0 && (
                    <Image source={hexagonIcon} style={{ width: 12, height: 12, tintColor: '#ef4444' }} resizeMode="contain" />
                  )}
                </View>
                <LineChart
                  data={{ labels: [], datasets: [{ data: spO2Data }] }}
                  width={screenWidth - 80}
                  height={120}
                  chartConfig={chartConfig}
                  bezier
                  style={caregiverElderInfoStyles.chart}
                  withInnerLines withOuterLines withVerticalLines={false} withHorizontalLines withDots withShadow={false}
                />
              </View>
            </>
          )}
        </View>

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
              <Text style={caregiverElderInfoStyles.infoValue}>{elderData.age || '-'}</Text>
            </View>
          </View>

          <View style={caregiverElderInfoStyles.infoSection}>
            <Text style={caregiverElderInfoStyles.infoSubtitle}>Location:</Text>
            {elderData.location ? (
              <>
                <View style={caregiverElderInfoStyles.locationRow}>
                  <Text style={caregiverElderInfoStyles.coordinatesText}>
                    {elderData.location.latitude}, {elderData.location.longitude}
                  </Text>
                  <TouchableOpacity onPress={copyCoordinates}>
                    <Image source={copyIcon} style={{ width: 16, height: 16, tintColor: '#374151' }} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={caregiverElderInfoStyles.mapContainer} 
                  onPress={openInMaps}
                  activeOpacity={0.9}
                >
                  <View style={{ width: '100%', height: '100%', backgroundColor: '#d1fae5', position: 'relative', overflow: 'hidden', borderRadius: 10 }}>
                    {/* Styled map preview with marker */}
                    <View style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#d1fae5',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}>
                      {/* Decorative grid pattern */}
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.15,
                        backgroundColor: 'transparent',
                        borderStyle: 'dashed',
                        borderWidth: 1,
                        borderColor: '#059669',
                      }} />
                      
                      {/* Map marker */}
                      <View style={{ alignItems: 'center', zIndex: 1 }}>
                        <Image 
                          source={mapMarkerIcon} 
                          style={{ width: 56, height: 56, tintColor: '#ef4444' }} 
                          resizeMode="contain" 
                        />
                        <View style={{
                          marginTop: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: 8,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                          minWidth: 180,
                        }}>
                          <Text style={{ color: '#374151', fontSize: 11, fontFamily: 'monospace', textAlign: 'center', fontWeight: '600' }}>
                            {elderData.location.latitude.toFixed(6)}
                          </Text>
                          <Text style={{ color: '#374151', fontSize: 11, fontFamily: 'monospace', textAlign: 'center', fontWeight: '600' }}>
                            {elderData.location.longitude.toFixed(6)}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Compass icon */}
                      <View style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }}>
                        <Text style={{ fontSize: 20 }}>🧭</Text>
                      </View>
                    </View>
                    <View style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: 'rgba(0, 128, 128, 0.95)',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}>
                      <Image source={mapMarkerIcon} style={{ width: 16, height: 16, tintColor: '#fff' }} resizeMode="contain" />
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 }}>Tap to open</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={caregiverElderInfoStyles.infoValue}>-</Text>
                <View style={[caregiverElderInfoStyles.mapContainer, caregiverElderInfoStyles.mapImage, { backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', minHeight: 200 }]}>
                  <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 }}>ไม่ได้เปิด location</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
