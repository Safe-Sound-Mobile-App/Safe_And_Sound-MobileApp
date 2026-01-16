import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addNewElderStyles } from '../../../global_style/caregiverUseSection/addNewElderStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

const elderIcon = require('../../../../assets/icons/elder.png');
const searchIcon = require('../../../../assets/icons/search.png');
const addIcon = require('../../../../assets/icons/plus.png');
const backIcon = require('../../../../assets/icons/direction/left.png');

// Mock Elder Search Result Interface
interface ElderSearchResult {
  uid: string;
  name: string;
  image: any;
}

// Mock database of available elders
const mockElderDatabase: ElderSearchResult[] = [
  { uid: 'ELDER66', name: 'Elder66', image: require('../../../../assets/icons/elder.png') },
  { uid: 'ELDER101', name: 'Elder101', image: require('../../../../assets/icons/elder.png') },
  { uid: 'ELDER45', name: 'Elder45', image: require('../../../../assets/icons/elder.png') },
  { uid: 'ELDER89', name: 'Elder89', image: require('../../../../assets/icons/elder.png') },
];

type Props = NativeStackScreenProps<RootStackParamList, "AddNewElder">;

export default function AddNewElder({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ElderSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedElder, setSelectedElder] = useState<ElderSearchResult | null>(null);

  // Real-time search effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate API call delay
    const searchTimeout = setTimeout(() => {
      const results = mockElderDatabase.filter(elder =>
        elder.uid.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Handle add elder
  const handleAddElder = (elder: ElderSearchResult) => {
    setSelectedElder(elder);
    setShowConfirmModal(true);
  };

  const confirmAddElder = () => {
    if (selectedElder) {
      console.log(`Adding elder: ${selectedElder.name} (${selectedElder.uid})`);
      // TODO: Call API to add elder to caregiver's list
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  // Render elder card
  const renderElderCard = (elder: ElderSearchResult) => {
    return (
      <View key={elder.uid} style={addNewElderStyles.elderCard}>
        <Image
          source={elder.image}
          style={addNewElderStyles.elderImage}
          resizeMode="cover"
        />
        
        <Text style={addNewElderStyles.elderName}>{elder.name}</Text>
        
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
      </View>
    );
  };

  return (
    <SafeAreaView style={addNewElderStyles.container}>
      {/* Header */}
      <GradientHeader title="Safe & Sound" />

      {/* Back Button */}
      <TouchableOpacity
        style={addNewElderStyles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Image
          source={backIcon}
          style={addNewElderStyles.backIcon}
          resizeMode="contain"
        />
        <Text style={addNewElderStyles.backText}>Back</Text>
      </TouchableOpacity>

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
                source={elderIcon}
                style={addNewElderStyles.modalIcon}
                resizeMode="contain"
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
              >
                <Text style={addNewElderStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={addNewElderStyles.modalConfirmButton}
                onPress={confirmAddElder}
                activeOpacity={0.7}
              >
                <Text style={addNewElderStyles.modalConfirmButtonText}>Add</Text>
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
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>

            <Text style={addNewElderStyles.modalTitle}>Success!</Text>
            <Text style={addNewElderStyles.modalMessage}>
              {selectedElder?.name} has been added to your care list.
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