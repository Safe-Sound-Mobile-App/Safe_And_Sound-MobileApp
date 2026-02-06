import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUpStyles } from '../../../global_style/signUpStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
// --- นำเข้า Firebase Auth ---
import auth from '@react-native-firebase/auth';

const googleIcon = require('../../../../assets/icons/google.png');
const usernameIcon = require('../../../../assets/icons/username.png');
const passwordIcon = require('../../../../assets/icons/password.png');

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUp({ navigation }: Props) {
  // ใน Firebase 'username' พื้นฐานจะเป็น 'email' นะครับ
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ฟังก์ชันสมัครสมาชิก
  const handleSignUp = async () => {
    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // 2. ส่งข้อมูลให้ Firebase สร้าง User
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      console.log('User account created & signed in!');
      
      // 3. เมื่อสำเร็จ นำทางไปหน้า RoleSelection
      // เราสามารถส่ง uid ไปเก็บใน Firestore ต่อที่หน้าโน้นได้
      navigation.navigate("RoleSelection"); 

    } catch (error: any) {
      // 4. จัดการ Error ต่างๆ
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Error", "That email address is already in use!");
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert("Error", "That email address is invalid!");
      } else if (error.code === 'auth/weak-password') {
        Alert.alert("Error", "Password should be at least 6 characters");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In pressed');
    // เดี๋ยวเราจะมาทำ Logic Google แยกต่างหากหลังจากทำ Email สำเร็จครับ
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={signUpStyles.signUpContainer}>
        
        <Text style={signUpStyles.signUpTitle}>SIGN UP</Text>
        
        {/* Email Input (เปลี่ยนจาก Username เพื่อให้สอดคล้องกับ Firebase) */}
        <View style={signUpStyles.inputContainer}>
            <Image 
              source={usernameIcon} 
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

        <View style={signUpStyles.signInContainer}>
          <Text style={signUpStyles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={signUpStyles.signInLink}>SIGN IN</Text>
          </TouchableOpacity>
        </View>

        <View style={signUpStyles.dividerContainer}>
          <View style={signUpStyles.dividerLine} />
          <Text style={signUpStyles.dividerText}>OR</Text>
          <View style={signUpStyles.dividerLine} />
        </View>

        <TouchableOpacity
          style={signUpStyles.googleSignInButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={signUpStyles.googleIconContainer}>
            <Image 
              source={googleIcon} 
              style={signUpStyles.googleIconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={signUpStyles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}