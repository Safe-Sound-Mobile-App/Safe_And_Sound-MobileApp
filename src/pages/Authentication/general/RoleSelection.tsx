import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Animated, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { roleSelectionStyles } from '../../../global_style/roleSelectionStyles';
import { Ionicons } from '@expo/vector-icons';

// Import your images
const elderImage = require('../../../../assets/icons/elder.png');
const caregiverImage = require('../../../../assets/icons/caregiver.png');

type Props = NativeStackScreenProps<RootStackParamList, "RoleSelection">;

export default function RoleSelection({ navigation }: Props) {
  const [selectedRole, setSelectedRole] = useState<'elder' | 'caregiver' | null>(null);
  const [elderAnimation] = useState(new Animated.Value(0));
  const [caregiverAnimation] = useState(new Animated.Value(0));
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  const handleRoleSelect = (role: 'elder' | 'caregiver') => {
    setSelectedRole(role);
    
    // Animate selected role
    const selectedAnimation = role === 'elder' ? elderAnimation : caregiverAnimation;
    const otherAnimation = role === 'elder' ? caregiverAnimation : elderAnimation;
    
    // Animate to gradient
    Animated.timing(selectedAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Animate other back to black
    Animated.timing(otherAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleConfirm = () => {
    if (selectedRole) {
      // Navigate to next screen based on selected role
      console.log('Selected role:', selectedRole);
      // navigation.navigate("NextScreen", { role: selectedRole });
    }
  };

  const renderRoleButton = (role: 'elder' | 'caregiver', imageSource: any, label: string) => {
    const isSelected = selectedRole === role;
    const animationValue = role === 'elder' ? elderAnimation : caregiverAnimation;
    
    // Interpolate colors for smooth transition
    const imageOpacity = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    
    const gradientOpacity = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    return (
      <TouchableOpacity
        style={[
          roleSelectionStyles.roleButton,
          isSelected && roleSelectionStyles.selectedRoleButton
        ]}
        onPress={() => handleRoleSelect(role)}
        activeOpacity={0.8}
      >
        {/* Single image with animated background */}
        <Animated.View style={[
          roleSelectionStyles.iconContainer,
          {
            backgroundColor: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', 'transparent'],
            })
          }
        ]}>
          {/* Background gradient (only visible when selected) */}
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 20,
                opacity: gradientOpacity,
              }
            ]}
          >
            <LinearGradient
              colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
              locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, borderRadius: 20 }}
            />
          </Animated.View>
          
          {/* Image always visible */}
          <Image 
            source={imageSource} 
            style={{ 
              width: 40, 
              height: 40,
              zIndex: 1,
              tintColor: isSelected ? '#FFFFFF' : '#000000'
            }}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Text style={[
          roleSelectionStyles.roleLabel,
          isSelected && roleSelectionStyles.selectedRoleLabel
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={roleSelectionStyles.container}>
      <View style={roleSelectionStyles.contentContainer}>
        
        {/* Title */}
        <Text style={roleSelectionStyles.title}>Role Selection</Text>
        
        {/* Subtitle */}
        <Text style={roleSelectionStyles.subtitle}>Please select your role:</Text>
        
        {/* Role Selection Buttons */}
        <View style={roleSelectionStyles.roleContainer}>
          {renderRoleButton('elder', elderImage, 'Elder')}
          {renderRoleButton('caregiver', caregiverImage, 'Caregiver')}
        </View>
        
        {/* Role Description Button */}
        <TouchableOpacity
            style={roleSelectionStyles.descriptionButton}
            onPress={() => setShowDescriptionModal(true)}
            activeOpacity={0.8}
        >
          <Ionicons name="help-circle-outline" size={16} color="#6b7280" />
          <Text style={roleSelectionStyles.descriptionText}>Role Description</Text>
        </TouchableOpacity>
        
        {/* Confirm/Next Button */}
        <TouchableOpacity
          style={[
            roleSelectionStyles.confirmButton,
            !selectedRole && roleSelectionStyles.disabledButton
          ]}
          onPress={handleConfirm}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text style={[
            roleSelectionStyles.confirmButtonText,
            !selectedRole && roleSelectionStyles.disabledButtonText
          ]}>
            {selectedRole ? 'Next' : 'Confirm'}
          </Text>
        </TouchableOpacity>
        
      </View>

    {/* Role Description Modal */}
        <Modal
          visible={showDescriptionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDescriptionModal(false)}
        >
          <View style={roleSelectionStyles.modalOverlay}>
            <View style={roleSelectionStyles.modalContainer}>
              <Text style={roleSelectionStyles.modalTitle}>Role Description</Text>
              
              <View style={roleSelectionStyles.modalContent}>
                <View style={roleSelectionStyles.questionSection}>
                  <Text style={roleSelectionStyles.questionText}>Why user need to select role?</Text>
                  <View style={roleSelectionStyles.underline} />
                </View>
                
                <View style={roleSelectionStyles.questionSection}>
                  <Text style={roleSelectionStyles.questionText}>What is the elder role?</Text>
                  <View style={roleSelectionStyles.underline} />
                </View>
                
                <View style={roleSelectionStyles.questionSection}>
                  <Text style={roleSelectionStyles.questionText}>What is the caregiver role?</Text>
                  <View style={roleSelectionStyles.underline} />
                </View>
              </View>
              
              <TouchableOpacity
                style={roleSelectionStyles.modalCloseButton}
                onPress={() => setShowDescriptionModal(false)}
                activeOpacity={0.8}
              >
                <Text style={roleSelectionStyles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}