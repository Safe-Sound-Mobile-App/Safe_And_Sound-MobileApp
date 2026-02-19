import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUpStyles } from '../../../global_style/signUpStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { signUpWithEmail, signInWithGoogle } from '../../../services/auth';

const googleIcon = require('../../../../assets/icons/google.png');
const emailIcon = require('../../../../assets/icons/email.png');
const passwordIcon = require('../../../../assets/icons/password.png');
const eyeIcon = require('../../../../assets/icons/invisible.png');

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUp({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateInputs = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email.trim(), password);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate("RoleSelection"),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Signed in with Google successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate("RoleSelection"),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to sign in with Google');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={signUpStyles.signUpContainer}>
        
        {/* Sign Up Title */}
        <Text style={signUpStyles.signUpTitle}>SIGN UP</Text>
        
        {/* Email Input */}
        <View style={signUpStyles.inputContainer}>
            <Image 
              source={emailIcon} 
              style={signUpStyles.inputIcon}
              resizeMode="contain"
            />
          <TextInput
            style={signUpStyles.textInput}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={signUpStyles.inputContainer}>
            <Image 
              source={passwordIcon} 
              style={signUpStyles.inputIcon}
              resizeMode="contain"
            />
          <TextInput
            style={signUpStyles.textInput}
            placeholder="Password (at least 6 characters)"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={signUpStyles.eyeIcon}
            disabled={loading}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={signUpStyles.inputContainer}>
            <Image 
              source={passwordIcon} 
              style={signUpStyles.inputIcon}
              resizeMode="contain"
            />
            <TextInput
            style={signUpStyles.textInput}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
            />
            <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={signUpStyles.eyeIcon}
            disabled={loading}
            >
            <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#6b7280"
            />
            </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[signUpStyles.signUpSubmitButton, loading && { opacity: 0.6 }]}
          onPress={handleSignUp}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={signUpStyles.signUpSubmitButtonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={signUpStyles.signInContainer}>
          <Text style={signUpStyles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={signUpStyles.signInLink}>SIGN IN</Text>
          </TouchableOpacity>
        </View>

        {/* OR Divider */}
        <View style={signUpStyles.dividerContainer}>
          <View style={signUpStyles.dividerLine} />
          <Text style={signUpStyles.dividerText}>OR</Text>
          <View style={signUpStyles.dividerLine} />
        </View>

        {/* Google Sign In Button - New Design */}
        <TouchableOpacity
          style={[signUpStyles.googleSignInButton, loading && { opacity: 0.6 }]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <View style={signUpStyles.googleIconContainer}>
                <Image 
                  source={googleIcon} 
                  style={signUpStyles.googleIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={signUpStyles.googleButtonText}>Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}