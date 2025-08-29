import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUpStyles } from '../../../global_style/signUpStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUp({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignIn = () => {
    console.log('Signing in with:', { username, password });
    // Handle sign in logic here
  };

  const handleSignUp = () => {
    console.log('Navigating to SignUp...');
    navigation.navigate("RoleSelection");
  };

  const handleForgotPassword = () => {
    console.log('Navigating to Forgot Password...');
    // Handle forgot password logic
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In pressed');
    // Handle Google sign in logic
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={signUpStyles.signUpContainer}>
        
        {/* Sign Up Title */}
        <Text style={signUpStyles.signUpTitle}>SIGN UP</Text>
        
        {/* Username Input */}
        <View style={signUpStyles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#6b7280" style={signUpStyles.inputIcon} />
          <TextInput
            style={signUpStyles.textInput}
            placeholder="Username"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={signUpStyles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={signUpStyles.inputIcon} />
          <TextInput
            style={signUpStyles.textInput}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={signUpStyles.eyeIcon}
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
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={signUpStyles.inputIcon} />
            <TextInput
            style={signUpStyles.textInput}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            />
            <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={signUpStyles.eyeIcon}
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
          style={signUpStyles.signUpSubmitButton}
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          <Text style={signUpStyles.signUpSubmitButtonText}>SIGN UP</Text>
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

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={signUpStyles.googleSignInButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={signUpStyles.googleIconContainer}>
            <Text style={signUpStyles.googleIcon}>G</Text>
          </View>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}