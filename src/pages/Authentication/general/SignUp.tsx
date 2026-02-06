import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUpStyles } from '../../../global_style/signUpStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";

// 1. นำเข้า Firebase และ Config
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '../../../../firebaseConfig'; // ตรวจสอบ path ให้ถูกว่าไฟล์ firebaseConfig อยู่ไหน

const googleIcon = require('../../../../assets/icons/google.png');
// เปลี่ยนไอคอน username เป็น email (ถ้ามี) หรือใช้ตัวเดิมไปก่อน
const usernameIcon = require('../../../../assets/icons/username.png'); 
const passwordIcon = require('../../../../assets/icons/password.png');

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUp({ navigation }: Props) {
  // 2. เปลี่ยน state จาก username เป็น email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // เพิ่ม state loading

  const auth = getAuth(app); // เตรียมตัวแปร auth

  const handleSignUp = async () => {
    // 3. ตรวจสอบความถูกต้องของข้อมูล (Validation)
    if (email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // 4. สั่งสร้าง User ใหม่ใน Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', userCredential.user.uid);
      
      Alert.alert("Success", "Account created successfully!", [
        { 
          text: "OK", 
          onPress: () => navigation.navigate("SignIn") // สมัครเสร็จเด้งไปหน้า Login (หรือ RoleSelection)
        }
      ]);

    } catch (error: any) {
      // 5. จัดการ Error (เช่น อีเมลซ้ำ, รูปแบบผิด)
      console.error(error);
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'That email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // การทำ Google Sign-In บน Expo Go ต้องใช้ Library พิเศษ (expo-auth-session)
    // แนะนำให้ทำ Email/Password ให้ผ่านก่อนครับ
    Alert.alert("Notice", "Google Sign-In requires additional setup with Expo Go.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={signUpStyles.signUpContainer}>
        
        <Text style={signUpStyles.signUpTitle}>SIGN UP</Text>
        
        {/* เปลี่ยน Username Input เป็น Email Input */}
        <View style={signUpStyles.inputContainer}>
            <Image 
              source={usernameIcon} 
              style={signUpStyles.inputIcon}
              resizeMode="contain"
            />
          <TextInput
            style={signUpStyles.textInput}
            placeholder="Email" // เปลี่ยน placeholder
            placeholderTextColor="#9ca3af"
            value={email} // ใช้ state email
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address" // เพิ่มคีย์บอร์ดแบบอีเมล
          />
        </View>

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
          disabled={loading} // ป้องกันการกดซ้ำ
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={signUpStyles.signUpSubmitButtonText}>SIGN UP</Text>
          )}
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