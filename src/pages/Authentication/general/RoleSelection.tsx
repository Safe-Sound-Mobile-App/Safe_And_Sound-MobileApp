import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { roleSelectionStyles } from '../../../global_style/roleSelectionStyles';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, "RoleSelection">;

export default function RoleSelection({ navigation }: Props) {
  const [selectedRole, setSelectedRole] = useState<'elder' | 'caregiver' | null>(null);

  const handleRoleSelect = (role: 'elder' | 'caregiver') => {
    setSelectedRole(role);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      // Navigate to next screen based on selected role
      console.log('Selected role:', selectedRole);
      // navigation.navigate("NextScreen", { role: selectedRole });
    }
  };

  const renderRoleButton = (role: 'elder' | 'caregiver', icon: string, label: string) => {
    const isSelected = selectedRole === role;
    
    return (
      <TouchableOpacity
        style={[
          roleSelectionStyles.roleButton,
          isSelected && roleSelectionStyles.selectedRoleButton
        ]}
        onPress={() => handleRoleSelect(role)}
        activeOpacity={0.8}
      >
        {isSelected ? (
          <MaskedView
            style={roleSelectionStyles.iconMaskContainer}
            maskElement={
              <View style={roleSelectionStyles.iconMask}>
                <Ionicons name={icon as any} size={40} color="black" />
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
              <Ionicons name={icon as any} size={40} color="transparent" />
            </LinearGradient>
          </MaskedView>
        ) : (
          <Ionicons name={icon as any} size={40} color="#000000" />
        )}
        
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
          {renderRoleButton('elder', 'accessibility-outline', 'Elder')}
          {renderRoleButton('caregiver', 'medical-outline', 'Caregiver')}
        </View>
        
        {/* Role Description Button */}
        <TouchableOpacity style={roleSelectionStyles.descriptionButton}>
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
    </SafeAreaView>
  );
}