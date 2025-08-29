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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    why: false,
    elder: false,
    caregiver: false,
  });

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

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      // Create new state object
      const newState = {
        why: false,
        elder: false,
        caregiver: false,
      };
      
      // If the clicked section is currently closed, open it
      // If it's currently open, keep it closed (all sections will be false)
      if (!prev[sectionKey]) {
        newState[sectionKey] = true;
      }
      
      return newState;
    });
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
        {/* Black image with animated opacity */}
        <Animated.View style={[
          roleSelectionStyles.iconContainer,
          { opacity: imageOpacity }
        ]}>
          <Image 
            source={imageSource} 
            style={{ 
              width: 40, 
              height: 40,
              tintColor: '#000000', // Apply black tint to the image
            }}
            resizeMode="contain"
          />
        </Animated.View>
        
        {/* Gradient image with animated opacity */}
        <Animated.View style={[
          roleSelectionStyles.iconContainer,
          { opacity: gradientOpacity }
        ]}>
          <MaskedView
            style={roleSelectionStyles.iconMaskContainer}
            maskElement={
              <View style={roleSelectionStyles.iconMask}>
                <Image 
                  source={imageSource} 
                  style={{ 
                    width: 40, 
                    height: 40 
                  }}
                  resizeMode="contain"
                />
              </View>
            }
          >
            <LinearGradient
              colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
              locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={roleSelectionStyles.gradientIcon}
            >
              <View style={{ width: 40, height: 40 }} />
            </LinearGradient>
          </MaskedView>
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
                <TouchableOpacity 
                  style={roleSelectionStyles.questionHeader}
                  onPress={() => toggleSection('why')}
                  activeOpacity={0.7}
                >
                  <Text style={roleSelectionStyles.questionText}>Why user need to select role?</Text>
                  <Ionicons 
                    name={expandedSections.why ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
                <View style={roleSelectionStyles.underline} />
                {expandedSections.why && (
                  <View style={roleSelectionStyles.answerContainer}>
                    <Text style={roleSelectionStyles.answerText}>
                      Role selection helps customize the app experience based on your specific needs. 
                      Each role provides tailored features, interface elements, and functionalities 
                      to better serve either elderly users or their caregivers.
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={roleSelectionStyles.questionSection}>
                <TouchableOpacity 
                  style={roleSelectionStyles.questionHeader}
                  onPress={() => toggleSection('elder')}
                  activeOpacity={0.7}
                >
                  <Text style={roleSelectionStyles.questionText}>What is the elder role?</Text>
                  <Ionicons 
                    name={expandedSections.elder ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
                <View style={roleSelectionStyles.underline} />
                {expandedSections.elder && (
                  <View style={roleSelectionStyles.answerContainer}>
                    <Text style={roleSelectionStyles.answerText}>
                      The elder role is designed for elderly users who are the primary users of the app. 
                      This role provides larger text, simplified navigation, emergency features, 
                      health monitoring tools, and direct access to assistance services.
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={roleSelectionStyles.questionSection}>
                <TouchableOpacity 
                  style={roleSelectionStyles.questionHeader}
                  onPress={() => toggleSection('caregiver')}
                  activeOpacity={0.7}
                >
                  <Text style={roleSelectionStyles.questionText}>What is the caregiver role?</Text>
                  <Ionicons 
                    name={expandedSections.caregiver ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
                <View style={roleSelectionStyles.underline} />
                {expandedSections.caregiver && (
                  <View style={roleSelectionStyles.answerContainer}>
                    <Text style={roleSelectionStyles.answerText}>
                      The caregiver role is for family members, healthcare providers, or professional 
                      caregivers who assist elderly individuals. This role includes monitoring dashboards, 
                      alert management, care coordination tools, and communication features.
                    </Text>
                  </View>
                )}
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