import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
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
  location: { latitude: number; longitude: number; accuracy: number | null } | null;
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

/** Google Maps–style blue dot colors */
const LOC_DOT_FILL = '#4285F4';
const LOC_HALO_FILL = 'rgba(66, 133, 244, 0.22)';
const LOC_HALO_STROKE = 'rgba(66, 133, 244, 0.45)';

/** Static map logical size (max 640 per side for Static API); scale=2 for sharpness on phones */
const STATIC_MAP_W = 600;
const STATIC_MAP_H = 220;

function clampLocationAccuracyMeters(accuracy: number | null | undefined): number {
  const raw = typeof accuracy === 'number' && accuracy > 0 ? accuracy : 45;
  return Math.min(120, Math.max(18, raw));
}

/** Approximate halo diameter (px) from GPS accuracy at ~zoom 16 for mid-latitudes */
function accuracyToHaloSizePx(accuracy: number | null | undefined): number {
  const m = clampLocationAccuracyMeters(accuracy);
  const d = Math.round(m * 1.1);
  return Math.min(140, Math.max(56, d));
}

function readNonEmptyString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

/**
 * `android.config.googleMaps` from app.json is not always present on `Constants.expoConfig`
 * in prebuild / dev client; `expo.extra.googleMapsApiKey` is reliably embedded for JS.
 */
function getExpoGoogleMapsApiKey(): string | null {
  const cfg = Constants.expoConfig;
  const fromExtra = readNonEmptyString(
    (cfg?.extra as { googleMapsApiKey?: string } | undefined)?.googleMapsApiKey
  );
  if (fromExtra) return fromExtra;

  const androidKey = readNonEmptyString(
    (cfg?.android as { config?: { googleMaps?: { apiKey?: string } } } | undefined)?.config
      ?.googleMaps?.apiKey
  );
  if (androidKey) return androidKey;

  const iosKey = readNonEmptyString(
    (cfg?.ios as { config?: { googleMaps?: { apiKey?: string } } } | undefined)?.config
      ?.googleMaps?.apiKey
  );
  if (iosKey) return iosKey;

  const manifest = Constants.manifest as
    | {
        extra?: { googleMapsApiKey?: string };
        android?: { config?: { googleMaps?: { apiKey?: string } } };
      }
    | null
    | undefined;
  return (
    readNonEmptyString(manifest?.extra?.googleMapsApiKey) ??
    readNonEmptyString(manifest?.android?.config?.googleMaps?.apiKey) ??
    null
  );
}

/**
 * Raster preview — works inside ScrollView where MapView tiles often stay blank on Android.
 * Enable "Maps Static API" for the same key in Google Cloud if the image fails to load.
 */
function buildStaticMapPreviewUri(latitude: number, longitude: number): string | null {
  const key = getExpoGoogleMapsApiKey();
  if (!key) return null;
  const q = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: '16',
    size: `${STATIC_MAP_W}x${STATIC_MAP_H}`,
    scale: '2',
    maptype: 'roadmap',
    key,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${q.toString()}`;
}

const locationBlueDotStyles = StyleSheet.create({
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: LOC_DOT_FILL,
    borderWidth: 3,
    borderColor: '#ffffff',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
});

type LocationPreviewProps = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  onOpenMaps: () => void;
};

function ElderLocationMapPreview({ latitude, longitude, accuracy, onOpenMaps }: LocationPreviewProps) {
  const previewUri = useMemo(
    () => buildStaticMapPreviewUri(latitude, longitude),
    [latitude, longitude]
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [previewUri]);

  const haloSize = accuracyToHaloSizePx(accuracy);
  const showOverlay = Boolean(previewUri && imageLoaded && !imageError);

  return (
    <View style={caregiverElderInfoStyles.mapContainer} collapsable={false}>
      {previewUri && !imageError ? (
        <Image
          key={`${latitude},${longitude}`}
          source={{ uri: previewUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : null}

      {(!previewUri || imageError) && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: '#e8eaed',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            },
          ]}
        >
          <Text style={{ color: '#5f6368', fontSize: 13, textAlign: 'center' }}>
            {imageError
              ? 'โหลดแผนที่ไม่สำเร็จ — เปิด Maps Static API สำหรับ API key นี้ใน Google Cloud หรือแตะปุ่มด้านล่าง'
              : 'ไม่พบ API key สำหรับแผนที่'}
          </Text>
        </View>
      )}

      {previewUri && !imageLoaded && !imageError && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f3f4' },
          ]}
        >
          <ActivityIndicator size="large" color="#008080" />
        </View>
      )}

      {showOverlay && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <View
            style={{
              position: 'absolute',
              width: haloSize,
              height: haloSize,
              borderRadius: haloSize / 2,
              backgroundColor: LOC_HALO_FILL,
              borderWidth: 1,
              borderColor: LOC_HALO_STROKE,
            }}
          />
          <View style={locationBlueDotStyles.dot} />
        </View>
      )}

      <TouchableOpacity
        onPress={onOpenMaps}
        activeOpacity={0.9}
        style={{
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
        }}
      >
        <Image source={mapMarkerIcon} style={{ width: 16, height: 16, tintColor: '#fff' }} resizeMode="contain" />
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 }}>Tap to open</Text>
      </TouchableOpacity>
    </View>
  );
}

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
          location: loc
            ? {
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: loc.accuracy ?? null,
              }
            : null,
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

  // Real-time elder location from Firestore (same source as elder device updates)
  useEffect(() => {
    let cancelled = false;
    const unsub = firestore()
      .collection('elders')
      .doc(elderId)
      .onSnapshot(
        (docSnap) => {
          if (cancelled) return;
          const d = docSnap.data();
          const loc = d?.currentLocation;
          setElderData((prev) => {
            if (!prev) return prev;
            if (
              !loc ||
              typeof loc.latitude !== 'number' ||
              typeof loc.longitude !== 'number'
            ) {
              return { ...prev, location: null };
            }
            return {
              ...prev,
              location: {
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: typeof loc.accuracy === 'number' ? loc.accuracy : null,
              },
            };
          });
        },
        (err) => console.error('Elder location listener:', err)
      );
    return () => {
      cancelled = true;
      unsub();
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

  return (
    <SafeAreaView style={caregiverElderInfoStyles.container}>
      <GradientHeader />
      <ScrollView
        style={caregiverElderInfoStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
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
            <View style={caregiverElderInfoStyles.vitalValueRow}>
              <Text style={caregiverElderInfoStyles.vitalLabel} numberOfLines={1}>
                Gyroscope Status:
              </Text>
              <Text style={[caregiverElderInfoStyles.vitalValue, { marginLeft: 8 }]} numberOfLines={1}>
                {isNotWearing ? '-' : elderData.gyroscope}
              </Text>
              {!isNotWearing && elderData.gyroscope !== 'Normal' && (
                <Image source={hexagonIcon} style={{ width: 12, height: 12, tintColor: '#f59e0b', marginLeft: 6 }} resizeMode="contain" />
              )}
            </View>
          </View>

          {isNotWearing ? (
            <>
              <View style={caregiverElderInfoStyles.chartContainer}>
                <Text style={caregiverElderInfoStyles.chartLabel}>Heart Rate: -</Text>
              </View>
              <View style={caregiverElderInfoStyles.chartContainer}>
                <Text style={caregiverElderInfoStyles.chartLabel}>SpO2: -</Text>
              </View>
            </>
          ) : (
            <>
              <View style={caregiverElderInfoStyles.chartContainer}>
                <View style={caregiverElderInfoStyles.chartHeader}>
                  <Text style={caregiverElderInfoStyles.chartLabel}>Heart Rate: {elderData.heartRate} Bpm</Text>
                </View>
              </View>
              <View style={caregiverElderInfoStyles.chartContainer}>
                <View style={caregiverElderInfoStyles.chartHeader}>
                  <Text style={caregiverElderInfoStyles.chartLabel}>SpO2: {elderData.spO2}%</Text>
                </View>
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
                <ElderLocationMapPreview
                  latitude={elderData.location.latitude}
                  longitude={elderData.location.longitude}
                  accuracy={elderData.location.accuracy}
                  onOpenMaps={openInMaps}
                />
              </>
            ) : (
              <View style={caregiverElderInfoStyles.locationUnavailableCard}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Image
                    source={mapMarkerIcon}
                    style={{ width: 22, height: 22, tintColor: '#9ca3af', marginRight: 12, marginTop: 1 }}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={caregiverElderInfoStyles.locationUnavailableTitle}>
                      No location shared
                    </Text>
                    <Text style={caregiverElderInfoStyles.locationUnavailableSubtitle}>
                      The elder may have turned off GPS or location permission for this app. Coordinates
                      will appear again when they turn sharing back on.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
