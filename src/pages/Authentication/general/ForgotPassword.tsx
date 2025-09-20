import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forgotPasswordStyles } from '../../../global_style/forgotPasswordStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

const emailIcon = require('../../../../assets/icons/email.png'); // ใช้ไอคอนเดียวกับ username

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPassword({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendVerification = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending password reset to:', email);
      // Handle forgot password logic here
      // await sendPasswordResetEmail(email);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Email Sent',
          'If an account with this email exists, you will receive a password reset link shortly.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    }
  };

  const handleBackToSignIn = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={forgotPasswordStyles.container}>

        {/* Title */}
        <Text style={forgotPasswordStyles.title}>Forgot Password</Text>
        
        {/* Description */}
        <Text style={forgotPasswordStyles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {/* Email Input */}
        <View style={forgotPasswordStyles.inputContainer}>
          <Image 
            source={emailIcon} 
            style={forgotPasswordStyles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={forgotPasswordStyles.textInput}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        {/* Send Verification Button */}
        <TouchableOpacity
          style={[
            forgotPasswordStyles.sendButton,
            isLoading && forgotPasswordStyles.sendButtonDisabled
          ]}
          onPress={handleSendVerification}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={forgotPasswordStyles.sendButtonText}>
            {isLoading ? 'Sending...' : 'Send Verification'}
          </Text>
        </TouchableOpacity>

        {/* Back to Sign In Link */}
        <View style={forgotPasswordStyles.signInContainer}>
          <Text style={forgotPasswordStyles.signInText}>Back to sign in? </Text>
          <TouchableOpacity onPress={handleBackToSignIn}>
            <Text style={forgotPasswordStyles.signInLink}>SIGN IN</Text>
          </TouchableOpacity>
        </View>

        {/* Mock Up New Password */}
        <View style={forgotPasswordStyles.signInContainer}>
          <Text style={forgotPasswordStyles.signInText}>Mockup New Password page </Text>
          <TouchableOpacity onPress={() => navigation.navigate("NewPassword")}>
            <Text style={forgotPasswordStyles.signInLink}>New Password</Text>
          </TouchableOpacity>
        </View>

        </View>
    </SafeAreaView>
  );
}