import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInStyles } from '../../../global_style/signInStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

const googleIcon = require('../../../../assets/icons/google.png');
const usernameIcon = require('../../../../assets/icons/username.png');
const passwordIcon = require('../../../../assets/icons/password.png');
const eyeIcon = require('../../../../assets/icons/invisible.png');

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignIn({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    console.log('Signing in with:', { username, password });
    // Handle sign in logic here
  };

  const handleSignUp = () => {
    console.log('Navigating to SignUp...');
    // navigation.navigate('SignUp');
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
      <View style={signInStyles.signInContainer}>
        
        {/* Sign In Title */}
        <Text style={signInStyles.signInTitle}>SIGN IN</Text>
        
        {/* Username Input */}
        <View style={signInStyles.inputContainer}>
            <Image 
              source={usernameIcon} 
              style={signInStyles.inputIcon}
              resizeMode="contain"
            />
          <TextInput
            style={signInStyles.textInput}
            placeholder="Username"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={signInStyles.eyeIcon}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} style={signInStyles.forgotPasswordContainer}>
          <Text style={signInStyles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={signInStyles.signInSubmitButton}
          onPress={handleSignIn}
          activeOpacity={0.8}
        >
          <Text style={signInStyles.signInSubmitButtonText}>SIGN IN</Text>
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
          style={signInStyles.googleSignInButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={signInStyles.googleIconContainer}>
            <Image 
              source={googleIcon} 
              style={signInStyles.googleIconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={signInStyles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}