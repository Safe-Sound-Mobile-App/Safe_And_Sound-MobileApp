import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { newPasswordStyles } from '../../../global_style/newPasswordStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

const passwordIcon = require('../../../../assets/icons/password.png');

type Props = NativeStackScreenProps<RootStackParamList, "NewPassword">;

export default function NewPassword({ navigation, route }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get reset token from navigation params (typically passed from email link)
  // const resetToken = route.params?.token;
  const resetToken = "dummy-token"; // Replace with actual token handling

  const validatePassword = (password: string) => {
    // Password should be at least 8 characters long and contain at least one number and one letter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters long and contain at least one letter and one number'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Resetting password with token:', resetToken);
      // Handle password reset logic here
      // await resetPassword(resetToken, newPassword);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. Please sign in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to SignIn and clear the stack
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'SignIn' }],
                });
              }
            }
          ]
        );
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    }
  };

  const handleBackToSignIn = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={newPasswordStyles.container}>
        
        {/* Back Arrow */}
        <TouchableOpacity 
          style={newPasswordStyles.backButton} 
          onPress={handleBackToSignIn}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={newPasswordStyles.title}>New Password</Text>
        
        {/* Description */}
        <Text style={newPasswordStyles.description}>
          Enter your new password below. Make sure it's strong and secure.
        </Text>

        {/* New Password Input */}
        <View style={newPasswordStyles.inputContainer}>
          <Image 
            source={passwordIcon} 
            style={newPasswordStyles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={newPasswordStyles.textInput}
            placeholder="New Password"
            placeholderTextColor="#9ca3af"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={newPasswordStyles.eyeIcon}
          >
            <Ionicons 
              name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={newPasswordStyles.inputContainer}>
          <Image 
            source={passwordIcon} 
            style={newPasswordStyles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={newPasswordStyles.textInput}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={newPasswordStyles.eyeIcon}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>

        {/* Password Requirements */}
        <View style={newPasswordStyles.requirementsContainer}>
          <Text style={newPasswordStyles.requirementsText}>
            Password must be at least 8 characters long and contain at least one letter and one number.
          </Text>
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity
          style={[
            newPasswordStyles.resetButton,
            isLoading && newPasswordStyles.resetButtonDisabled
          ]}
          onPress={handleResetPassword}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={newPasswordStyles.resetButtonText}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}