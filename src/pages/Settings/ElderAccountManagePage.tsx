import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/elderUseSection/elderSettingStyles';
import auth from '@react-native-firebase/auth';
import { getElderCaregivers, getUserProfile, deleteRelationship } from '../../services/firestore';

type Props = NativeStackScreenProps<RootStackParamList, "ElderAccountManage">;

interface CaregiverItem {
  id: string;
  name: string;
  status: 'active' | 'pending';
  photoURL: string | null;
  addedDate: string;
}

export default function ElderAccountManagePage({ navigation }: Props) {
  const [caregivers, setCaregivers] = useState<CaregiverItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCaregivers = useCallback(async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const result = await getElderCaregivers(currentUser.uid);
      if (result.success && result.data) {
        const caregiversData: CaregiverItem[] = await Promise.all(
          result.data.map(async (caregiver) => {
            const userResult = await getUserProfile(caregiver.userId);
            return {
              id: caregiver.userId,
              name: userResult.success && userResult.data
                ? `${userResult.data.firstName} ${userResult.data.lastName}`
                : 'Unknown',
              status: 'active' as const,
              photoURL: userResult.data?.photoURL || null,
              addedDate: 'N/A', // TODO: Get from relationship createdAt
            };
          })
        );
        setCaregivers(caregiversData);
      }
    } catch (error) {
      console.error('Error fetching caregivers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCaregivers();
    }, [fetchCaregivers])
  );

  const handleRemoveCaregiver = (caregiver: CaregiverItem) => {
    Alert.alert(
      'Remove Caregiver',
      `Are you sure you want to remove ${caregiver.name} from caring for you?\n\nThis will remove all shared data and chat history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth().currentUser;
              if (!currentUser) return;

              const result = await deleteRelationship(caregiver.id, currentUser.uid);
              
              if (result.success) {
                Alert.alert('Success', `Removed ${caregiver.name} successfully`);
                fetchCaregivers();
                // Open Notification > Activities so user sees "Relationship Removed" right away
                navigation.navigate('ElderMainTabs', { screen: 'ElderNotification', params: { openActivities: true } });
              } else {
                Alert.alert('Error', result.error || 'Failed to remove caregiver');
              }
            } catch (error) {
              console.error('Error removing caregiver:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const renderCaregiverItem = (caregiver: CaregiverItem) => (
    <View key={caregiver.id} style={styles.caregiverCard}>
      <View style={styles.caregiverInfo}>
        {caregiver.photoURL ? (
          <Image source={{ uri: caregiver.photoURL }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.profilePlaceholder]}>
            <Ionicons name="person" size={30} color="#9ca3af" />
          </View>
        )}
        
        <View style={styles.caregiverDetails}>
          <Text style={styles.caregiverName}>{caregiver.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, caregiver.status === 'active' ? styles.activeStatus : styles.pendingStatus]}>
              <Text style={styles.statusText}>{caregiver.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveCaregiver(caregiver)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={caregiverSettingStyles.container}>
      <GradientHeader title="Safe & Sound" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Caregivers</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Caregivers</Text>
        <Text style={styles.caregiverCount}>{caregivers.length} / 5 Caregivers</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008080" />
          </View>
        ) : caregivers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyText}>No caregivers added yet</Text>
            <Text style={styles.emptySubtext}>Wait for caregiver requests</Text>
          </View>
        ) : (
          <View style={styles.caregiversList}>
            {caregivers.map(renderCaregiverItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginTop: 20,
    marginHorizontal: 20,
  },
  caregiverCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  caregiversList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  caregiverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  caregiverInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profilePlaceholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  caregiverDetails: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeStatus: {
    backgroundColor: '#d1fae5',
  },
  pendingStatus: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#065f46',
  },
  removeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
};
