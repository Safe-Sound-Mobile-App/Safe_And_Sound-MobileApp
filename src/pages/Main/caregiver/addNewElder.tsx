import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addNewElderStyles } from '../../../global_style/caregiverUseSection/addNewElderStyles';
import GradientHeader from '../../../header/GradientHeader';
import BottomNavbar from '../../../navigation/BottomNavbar';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

const elderIcon = require('../../../../assets/icons/elder.png');
const searchIcon = require('../../../../assets/icons/search.png');
const addIcon = require('../../../../assets/icons/plus.png');

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
    Alert.alert(
      'Add Elder',
      `Do you want to add ${elder.name} (UID: ${elder.uid}) to your care list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Add',
          onPress: () => {
            console.log(`Adding elder: ${elder.name} (${elder.uid})`);
            // TODO: Call API to add elder to caregiver's list
            Alert.alert('Success', `${elder.name} has been added to your care list.`, [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]);
          }
        }
      ]
    );
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

      {/* Bottom Navigation */}
      <BottomNavbar />
    </SafeAreaView>
  );
}