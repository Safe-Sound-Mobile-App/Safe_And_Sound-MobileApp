import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { caregiverSettingStyles } from '../../global_style/caregiverUseSection/caregiverSettingStyles';
import auth from '@react-native-firebase/auth';
import { getCaregiverElders, getUserProfile, deleteRelationship } from '../../services/firestore';

type Props = NativeStackScreenProps<RootStackParamList, "CaregiverAccountManage">;

interface ElderItem {
  id: string;
  name: string;
  status: 'active' | 'pending';
  photoURL: string | null;
  addedDate: string;
}

export default function CaregiverAccountManagePage({ navigation }: Props) {
  const [elders, setElders] = useState<ElderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElders();
  }, []);

  const fetchElders = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const result = await getCaregiverElders(currentUser.uid);
      if (result.success && result.data) {
        const eldersData: ElderItem[] = await Promise.all(
          result.data.map(async (elder) => {
            const userResult = await getUserProfile(elder.userId);
            return {
              id: elder.userId,
              name: userResult.success && userResult.data
                ? `${userResult.data.firstName} ${userResult.data.lastName}`
                : 'Unknown',
              status: 'active' as const,
              photoURL: userResult.data?.photoURL || null,
              addedDate: 'N/A', // TODO: Get from relationship createdAt
            };
          })
        );
        setElders(eldersData);
      }
    } catch (error) {
      console.error('Error fetching elders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveElder = (elder: ElderItem) => {
    Alert.alert(
      'Remove Elder',
      `Are you sure you want to stop caring for ${elder.name}?\n\nThis will remove all shared data and chat history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth().currentUser;
              if (!currentUser) return;

              const result = await deleteRelationship(currentUser.uid, elder.id);
              
              if (result.success) {
                Alert.alert('Success', `Removed ${elder.name} successfully`);
                // Refresh the list
                fetchElders();
              } else {
                Alert.alert('Error', result.error || 'Failed to remove elder');
              }
            } catch (error) {
              console.error('Error removing elder:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const renderElderItem = (elder: ElderItem) => (
    <View key={elder.id} style={styles.elderCard}>
      <View style={styles.elderInfo}>
        {elder.photoURL ? (
          <Image source={{ uri: elder.photoURL }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.profilePlaceholder]}>
            <Ionicons name="person" size={30} color="#9ca3af" />
          </View>
        )}
        
        <View style={styles.elderDetails}>
          <Text style={styles.elderName}>{elder.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, elder.status === 'active' ? styles.activeStatus : styles.pendingStatus]}>
              <Text style={styles.statusText}>{elder.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveElder(elder)}
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
        <Text style={styles.headerTitle}>Manage Elders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Elders You Care For</Text>
        <Text style={styles.elderCount}>{elders.length} / 5 Elders</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008080" />
          </View>
        ) : elders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyText}>No elders added yet</Text>
            <Text style={styles.emptySubtext}>Add elders from the home page</Text>
          </View>
        ) : (
          <View style={styles.eldersList}>
            {elders.map(renderElderItem)}
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
  elderCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  eldersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  elderCard: {
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
  elderInfo: {
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
  elderDetails: {
    flex: 1,
  },
  elderName: {
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
