import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addNewElderStyles } from '../../../global_style/caregiverUseSection/addNewElderStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import auth from '@react-native-firebase/auth';
import { searchElderByUid, createRelationship, getRelationshipStatus } from '../../../services/firestore';

const elderIcon = require('../../../../assets/icons/elder.png');
const searchIcon = require('../../../../assets/icons/search.png');
const addIcon = require('../../../../assets/icons/plus.png');

// Elder Search Result Interface
type RelationshipStatus = 'none' | 'pending' | 'active';

interface ElderSearchResult {
  uid: string;
  name: string;
  photoURL: string | null;
  relationshipStatus: RelationshipStatus;
}

type Props = NativeStackScreenProps<RootStackParamList, "AddNewElder">;

export default function AddNewElder({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ElderSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedElder, setSelectedElder] = useState<ElderSearchResult | null>(null);
  const [adding, setAdding] = useState(false);

  // Real-time search effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Search in Firestore and check existing relationship
    const searchTimeout = setTimeout(async () => {
      try {
        const currentUser = auth().currentUser;
        const result = await searchElderByUid(searchQuery.trim());

        if (result.success && result.data) {
          const elderId = result.data.user.uid;
          let relationshipStatus: RelationshipStatus = 'none';
          if (currentUser) {
            const statusResult = await getRelationshipStatus(currentUser.uid, elderId);
            if (statusResult.success && statusResult.data) {
              relationshipStatus = statusResult.data;
            }
          }
          const elderData: ElderSearchResult = {
            uid: elderId,
            name: `${result.data.user.firstName} ${result.data.user.lastName}`,
            photoURL: result.data.user.photoURL ?? null,
            relationshipStatus,
          };
          setSearchResults([elderData]);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Handle add elder (only when status is 'none')
  const handleAddElder = (elder: ElderSearchResult) => {
    if (elder.relationshipStatus !== 'none') return;
    setSelectedElder(elder);
    setShowConfirmModal(true);
  };

  const confirmAddElder = async () => {
    if (!selectedElder) return;

    setAdding(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No authenticated user found');
        return;
      }

      // Create relationship
      const result = await createRelationship(
        currentUser.uid,
        selectedElder.uid,
        'professional' // or 'family', 'volunteer'
      );

      if (result.success) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to add elder');
      }
    } catch (error: any) {
      console.error('Add elder error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setAdding(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  // Render elder card (show Add only when no existing relationship)
  const renderElderCard = (elder: ElderSearchResult) => {
    const canAdd = elder.relationshipStatus === 'none';
    const statusLabel =
      elder.relationshipStatus === 'active'
        ? 'In your care list'
        : elder.relationshipStatus === 'pending'
          ? 'Request pending'
          : null;

    return (
      <View key={elder.uid} style={addNewElderStyles.elderCard}>
        <Image
          source={elder.photoURL ? { uri: elder.photoURL } : elderIcon}
          style={addNewElderStyles.elderImage}
          resizeMode="cover"
        />

        <View style={addNewElderStyles.elderCardCenter}>
          <Text style={addNewElderStyles.elderName}>{elder.name}</Text>
          {statusLabel != null && (
            <Text style={addNewElderStyles.relationshipStatusText}>{statusLabel}</Text>
          )}
        </View>

        {canAdd ? (
          <TouchableOpacity
            style={addNewElderStyles.addButton}
            onPress={() => handleAddElder(elder)}
            activeOpacity={0.7}
          >
            <Image
              source={addIcon}
              style={{ width: 16, height: 16, tintColor: '#ffffff' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <View style={addNewElderStyles.addButtonDisabled}>
            <Text style={addNewElderStyles.addButtonDisabledText}>
              {elder.relationshipStatus === 'pending' ? 'Pending' : 'Added'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={addNewElderStyles.container}>
      {/* Header */}
      <GradientHeader title="Safe & Sound" />

      <ScrollView
        style={addNewElderStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={addNewElderStyles.titleSection}>
          <Image
            source={elderIcon}
            style={addNewElderStyles.titleIcon}
            resizeMode="contain"
          />
          <Text style={addNewElderStyles.title}>Add Elder</Text>
        </View>

        {/* Search Input */}
        <View style={addNewElderStyles.searchContainer}>
          <TextInput
            style={addNewElderStyles.searchInput}
            placeholder="Please type elder UID"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={addNewElderStyles.searchIconButton}>
            <Image 
              source={searchIcon} 
              style={{ width: 22, height: 22, tintColor: '#374151' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        <View style={addNewElderStyles.resultsContainer}>
          {isSearching && (
            <Text style={addNewElderStyles.searchingText}>Searching...</Text>
          )}

          {!isSearching && searchQuery.trim() !== '' && searchResults.length === 0 && (
            <Text style={addNewElderStyles.noResultsText}>
              No elder found with UID: "{searchQuery}"
            </Text>
          )}

          {!isSearching && searchResults.length > 0 && (
            <>
              {searchResults.map(elder => renderElderCard(elder))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={addNewElderStyles.modalOverlay}>
          <View style={addNewElderStyles.modalContainer}>
            <View style={addNewElderStyles.modalIconContainer}>
              <Image
                source={selectedElder?.photoURL ? { uri: selectedElder.photoURL } : elderIcon}
                style={selectedElder?.photoURL ? addNewElderStyles.modalProfileImage : addNewElderStyles.modalIcon}
                resizeMode={selectedElder?.photoURL ? 'cover' : 'contain'}
              />
            </View>

            <Text style={addNewElderStyles.modalTitle}>Add Elder</Text>
            <Text style={addNewElderStyles.modalMessage}>
              Do you want to add {selectedElder?.name} (UID: {selectedElder?.uid}) to your care list?
            </Text>

            <View style={addNewElderStyles.modalButtonContainer}>
              <TouchableOpacity
                style={addNewElderStyles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
                disabled={adding}
              >
                <Text style={addNewElderStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[addNewElderStyles.modalConfirmButton, adding && { opacity: 0.6 }]}
                onPress={confirmAddElder}
                activeOpacity={0.7}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={addNewElderStyles.modalConfirmButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={addNewElderStyles.modalOverlay}>
          <View style={addNewElderStyles.modalContainer}>
            <View style={addNewElderStyles.successIconContainer}>
              <Ionicons name="send" size={64} color="#10b981" />
            </View>

            <Text style={addNewElderStyles.modalTitle}>Request sent</Text>
            <Text style={addNewElderStyles.modalMessage}>
              Your request has been sent to {selectedElder?.name}. They will see it in their Caregiver Request tab and can accept or decline.
            </Text>

            <TouchableOpacity
              style={addNewElderStyles.modalSuccessButton}
              onPress={handleSuccessClose}
              activeOpacity={0.7}
            >
              <Text style={addNewElderStyles.modalSuccessButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}