import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInStyles } from '../../../global_style/signInStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import { signInWithEmail, signInWithGoogle } from '../../../services/auth';
import { getUserProfile } from '../../../services/firestore';

const googleIcon = require('../../../../assets/icons/google.png');
const emailIcon = require('../../../../assets/icons/email.png');
const passwordIcon = require('../../../../assets/icons/password.png');
const eyeIcon = require('../../../../assets/icons/invisible.png');

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignIn({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      
      if (result.success && result.user) {
        // Check user profile in Firestore
        const profileResult = await getUserProfile(result.user.uid);
        
        if (profileResult.success && profileResult.data) {
          const userRole = profileResult.data.role;
          
          // Navigate based on role
          if (userRole === 'elder') {
            navigation.navigate('ElderMainTabs');
          } else if (userRole === 'caregiver') {
            navigation.navigate('MainTabs');
          } else {
            // No profile found, go to RoleSelection
            navigation.navigate('RoleSelection');
          }
        } else {
          // Profile not found, go to RoleSelection
          navigation.navigate('RoleSelection');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to sign in');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        // Check user profile in Firestore
        const profileResult = await getUserProfile(result.user.uid);
        
        if (profileResult.success && profileResult.data) {
          const userRole = profileResult.data.role;
          
          // Navigate based on role
          if (userRole === 'elder') {
            navigation.navigate('ElderMainTabs');
          } else if (userRole === 'caregiver') {
            navigation.navigate('MainTabs');
          } else {
            // No profile found, go to RoleSelection
            navigation.navigate('RoleSelection');
          }
        } else {
          // Profile not found (new user), go to RoleSelection
          navigation.navigate('RoleSelection');
        }
      } else {
        if (result.error && !result.error.includes('cancelled')) {
          Alert.alert('Error', result.error || 'Failed to sign in with Google');
        }
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={signInStyles.signInContainer}>
        
        {/* Sign In Title */}
        <Text style={signInStyles.signInTitle}>SIGN IN</Text>
        
        {/* Email Input */}
        <View style={signInStyles.inputContainer}>
            <Image 
              source={emailIcon} 
              style={signInStyles.inputIcon}
              resizeMode="contain"
            />
          <TextInput
            style={signInStyles.textInput}
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
        <View style={signInStyles.inputContainer}>
            <Image 
              source={passwordIcon} 
              style={signInStyles.inputIcon}
              resizeMode="contain"
            />
          <TextInput
            style={signInStyles.textInput}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={signInStyles.eyeIcon}
            disabled={loading}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity 
          onPress={() => navigation.navigate("ForgotPassword")} 
          style={signInStyles.forgotPasswordContainer}
          disabled={loading}
        >
          <Text style={signInStyles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[signInStyles.signInSubmitButton, loading && { opacity: 0.6 }]}
          onPress={handleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={signInStyles.signInSubmitButtonText}>SIGN IN</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={signInStyles.signUpContainer}>
          <Text style={signInStyles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={signInStyles.signUpLink}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        {/* OR Divider */}
        <View style={signInStyles.dividerContainer}>
          <View style={signInStyles.dividerLine} />
          <Text style={signInStyles.dividerText}>OR</Text>
          <View style={signInStyles.dividerLine} />
        </View>

        {/* Google Sign In Button - New Design */}
        <TouchableOpacity
          style={[signInStyles.googleSignInButton, loading && { opacity: 0.6 }]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <View style={signInStyles.googleIconContainer}>
                <Image 
                  source={googleIcon} 
                  style={signInStyles.googleIconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={signInStyles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}