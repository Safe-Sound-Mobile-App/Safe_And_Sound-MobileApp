import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { editProfileStyles } from '../../../global_style/caregiverUseSection/caregiverEditProfileStyles';
import GradientHeader from '../../../header/GradientHeader';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import auth from '@react-native-firebase/auth';
import { updateUserProfile } from '../../../services/firestore';

// Import icons
const nameIcon = require('../../../../assets/icons/profile/name.png');
const telIcon = require('../../../../assets/icons/profile/tel.png');

type Props = NativeStackScreenProps<RootStackParamList, "caregiverEditProfile">;

export default function caregiverEditProfile({ navigation, route }: Props) {
  const { profile } = route.params || {};
  
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [tel, setTel] = useState(profile?.tel || '');

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
  });
  const [saving, setSaving] = useState(false);

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {
      firstName: firstName.trim() === '',
      lastName: lastName.trim() === '',
    };
    setErrors(newErrors);
    return !newErrors.firstName && !newErrors.lastName;
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (!validateInputs()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'No authenticated user');
      return;
    }

    setSaving(true);
    try {
      const result = await updateUserProfile(currentUser.uid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        tel: tel.trim() || undefined,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={editProfileStyles.container}>
      <GradientHeader title="Safe & Sound" />

      <ScrollView
        style={editProfileStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={editProfileStyles.title}>Edit Information</Text>

        {/* Form */}
        <View style={editProfileStyles.form}>
          {/* First Name */}
          <View style={editProfileStyles.inputGroup}>
            <View style={[
              editProfileStyles.inputContainer,
              errors.firstName && editProfileStyles.inputError
            ]}>
              <Image
                source={nameIcon}
                style={editProfileStyles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={editProfileStyles.textInput}
                placeholder="First Name"
                placeholderTextColor="#9ca3af"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  setErrors(prev => ({ ...prev, firstName: false }));
                }}
              />
              {errors.firstName && (
                <Text style={editProfileStyles.requiredMark}>*</Text>
              )}
            </View>
          </View>

          {/* Last Name */}
          <View style={editProfileStyles.inputGroup}>
            <View style={[
              editProfileStyles.inputContainer,
              errors.lastName && editProfileStyles.inputError
            ]}>
              <TextInput
                style={[editProfileStyles.textInput, { marginLeft: 36 }]}
                placeholder="Last Name"
                placeholderTextColor="#9ca3af"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  setErrors(prev => ({ ...prev, lastName: false }));
                }}
              />
              {errors.lastName && (
                <Text style={editProfileStyles.requiredMark}>*</Text>
              )}
            </View>
          </View>

          {/* Tel */}
          <View style={editProfileStyles.inputGroup}>
            <View style={editProfileStyles.inputContainer}>
              <Image
                source={telIcon}
                style={editProfileStyles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={editProfileStyles.textInput}
                placeholder="Tel."
                placeholderTextColor="#9ca3af"
                value={tel}
                onChangeText={setTel}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={editProfileStyles.buttonContainer}>
            <TouchableOpacity
              style={editProfileStyles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={editProfileStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[editProfileStyles.confirmButton, saving && { opacity: 0.6 }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={editProfileStyles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}