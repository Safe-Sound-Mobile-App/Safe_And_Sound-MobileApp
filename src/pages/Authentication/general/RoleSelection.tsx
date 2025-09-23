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
const helpIcon = require('../../../../assets/icons/help.png');

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

  // Animation values for accordion sections
  const [sectionAnimations] = useState({
    why: new Animated.Value(0),
    elder: new Animated.Value(0),
    caregiver: new Animated.Value(0),
  });

  const handleRoleSelect = (role: 'elder' | 'caregiver') => {
    setSelectedRole(role);
    
    // Animate selected role
    const selectedAnimation = role === 'elder' ? elderAnimation : caregiverAnimation;
    const otherAnimation = role === 'elder' ? caregiverAnimation : elderAnimation;
    
    // Animate to gradient
    Animated.timing(selectedAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
    
    // Animate other back to black
    Animated.timing(otherAnimation, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleConfirm = () => {
    if (selectedRole) {
      // Navigate to next screen based on selected role
      console.log('Selected role:', selectedRole);
      if (selectedRole === 'elder') {
        navigation.navigate("ElderInfoForm");
      } else (navigation.navigate("CaregiverInfoForm"));
      // navigation.navigate("NextScreen", { role: selectedRole });
    }
  };

  const toggleSection = (sectionKey: string) => {
    const currentlyExpanded = expandedSections[sectionKey];
    
    // First, collapse all other sections with delay
    Object.keys(expandedSections).forEach((key) => {
      if (key !== sectionKey && expandedSections[key]) {
        Animated.timing(sectionAnimations[key], {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }).start(() => {
          // Update state after animation completes
          setExpandedSections(prev => ({
            ...prev,
            [key]: false
          }));
        });
      }
    });
    
    // Then handle the clicked section
    if (currentlyExpanded) {
      // If currently expanded, collapse it
      Animated.timing(sectionAnimations[sectionKey], {
        toValue: 0,
        duration: 50,
        useNativeDriver: false,
      }).start(() => {
        setExpandedSections(prev => ({
          ...prev,
          [sectionKey]: false
        }));
      });
    } else {
      // If currently collapsed, expand it after a delay
      setTimeout(() => {
        setExpandedSections(prev => ({
          ...prev,
          [sectionKey]: true
        }));
        
        Animated.timing(sectionAnimations[sectionKey], {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }, 150); // Delay before expanding
    }
  };

  const renderAnimatedSection = (sectionKey: string, content: React.ReactNode) => {
    const animatedHeight = sectionAnimations[sectionKey].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 140], // Adjust this value based on your content height
    });

    const opacity = sectionAnimations[sectionKey].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <Animated.View style={{
        height: animatedHeight,
        opacity: opacity,
        overflow: 'hidden',
      }}>
        {content}
      </Animated.View>
    );
  };

  const renderRoleButton = (role: 'elder' | 'caregiver', imageSource: any, label: string) => {
    const isSelected = selectedRole === role;
    const animationValue = role === 'elder' ? elderAnimation : caregiverAnimation;
    
    return (
      <TouchableOpacity
        style={[
          roleSelectionStyles.roleButton,
          isSelected && roleSelectionStyles.selectedRoleButton
        ]}
        onPress={() => handleRoleSelect(role)}
        activeOpacity={0.8}
      >
        {/* Icon Container */}
        <View style={roleSelectionStyles.iconWrapper}>
          {!isSelected ? (
            // Show black icon when not selected
            <Image 
              source={imageSource} 
              style={{ 
                width: 40, 
                height: 40,
                tintColor: '#000000',
              }}
              resizeMode="contain"
            />
          ) : (
            // Show gradient icon when selected
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
          )}
        </View>
        
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
            <Image 
              source={helpIcon} 
              style={{ width: 20, height: 20, tintColor: '#6b7280' }}
              resizeMode="contain"
            />
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
                  <Animated.View style={{
                    transform: [{
                      rotate: sectionAnimations.why.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      })
                    }]
                  }}>
                    <Ionicons 
                      name="chevron-down"
                      size={20} 
                      color="#6b7280" 
                    />
                  </Animated.View>
                </TouchableOpacity>
                <View style={roleSelectionStyles.underline} />
                {renderAnimatedSection('why',
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
                  <Animated.View style={{
                    transform: [{
                      rotate: sectionAnimations.elder.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      })
                    }]
                  }}>
                    <Ionicons 
                      name="chevron-down"
                      size={20} 
                      color="#6b7280" 
                    />
                  </Animated.View>
                </TouchableOpacity>
                <View style={roleSelectionStyles.underline} />
                {renderAnimatedSection('elder',
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
                  <Animated.View style={{
                    transform: [{
                      rotate: sectionAnimations.caregiver.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      })
                    }]
                  }}>
                    <Ionicons 
                      name="chevron-down"
                      size={20} 
                      color="#6b7280" 
                    />
                  </Animated.View>
                </TouchableOpacity>
                <View style={roleSelectionStyles.underline} />
                {renderAnimatedSection('caregiver',
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