import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUpStyles } from '../../../global_style/signUpStyles';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import * as WebBrowser from 'expo-web-browser'; 
import * as Google from 'expo-auth-session/providers/google'; 
import { makeRedirectUri } from 'expo-auth-session';

// Firebase Imports
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';

// ✅ แก้: Import 'auth' เข้ามาด้วย (แทนที่จะเรียก getAuth เอง)
import { auth } from '../../../../firebaseConfig'; 

WebBrowser.maybeCompleteAuthSession();

const googleIcon = require('../../../../assets/icons/google.png');
const usernameIcon = require('../../../../assets/icons/username.png');
const passwordIcon = require('../../../../assets/icons/password.png');

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUp({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ❌ ลบตัวนี้ออก: const auth = getAuth(app); 
  // เราจะใช้ 'auth' ที่ import มาจากด้านบนแทนครับ

  // --- Google Sign-In Config ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '218489558221-mk7gp0j6f26o1irscrnb3aif0fb60jje.apps.googleusercontent.com', 
    // 2. Android Client ID (แก้: ให้ใส่เลขเดียวกับ Web ไปเลยครับ สำหรับ Expo Go)
    androidClientId: '218489558221-mk7gp0j6f26o1irscrnb3aif0fb60jje.apps.googleusercontent.com',
    
    // 3. (แถม) iOS ก็ใส่เหมือนกันกันเหนียว
    iosClientId: '218489558221-mk7gp0j6f26o1irscrnb3aif0fb60jje.apps.googleusercontent.com',
  
    redirectUri: 'https://auth.expo.io/@tagch/safe-and-sound-mobileapp',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      
      // ใช้ auth ตัวที่ import มา
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          console.log('Google Sign-In Success:', userCredential.user.uid);
          Alert.alert("Success", "Signed up with Google successfully!", [
             { text: "OK", onPress: () => navigation.navigate("RoleSelection") }
          ]);
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Error", error.message);
        })
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      Alert.alert("Google Sign-In Error", "Something went wrong. Please try again.");
    }
  }, [response]);

  const handleSignUp = async () => {
    if (email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
    }

    setLoading(true);
    try {
      // ใช้ auth ตัวที่ import มา
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.navigate("SignIn") }
      ]);
    } catch (error: any) {
      let msg = error.message;
      if(error.code === 'auth/email-already-in-use') msg = 'Email is already in use.';
      if(error.code === 'auth/invalid-email') msg = 'Email format is invalid.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={signUpStyles.signUpContainer}>
        <Text style={signUpStyles.signUpTitle}>SIGN UP</Text>
        
        <View style={signUpStyles.inputContainer}>
            <Image source={usernameIcon} style={signUpStyles.inputIcon} resizeMode="contain" />
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

        <View style={signUpStyles.inputContainer}>
            <Image source={passwordIcon} style={signUpStyles.inputIcon} resizeMode="contain" />
          <TextInput
            style={signUpStyles.textInput}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={signUpStyles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={signUpStyles.inputContainer}>
            <Image source={passwordIcon} style={signUpStyles.inputIcon} resizeMode="contain" />
            <TextInput
            style={signUpStyles.textInput}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={signUpStyles.eyeIcon}>
            <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6b7280" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={signUpStyles.signUpSubmitButton} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={signUpStyles.signUpSubmitButtonText}>SIGN UP</Text>}
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
          onPress={() => promptAsync()} 
          disabled={!request}
        >
          <View style={signUpStyles.googleIconContainer}>
            <Image source={googleIcon} style={signUpStyles.googleIconImage} resizeMode="contain" />
          </View>
          <Text style={signUpStyles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}