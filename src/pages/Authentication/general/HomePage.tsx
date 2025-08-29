import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Button} from 'react-native';
import { styles } from '../../../global_style/style';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
// import { useFonts, BalooBhaijaan2_400Regular, BalooBhaijaan2_600SemiBold } from '@expo-google-fonts/baloo-bhaijaan-2';

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ navigation }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a202c' }}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          
          {/* Logo area */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              {/* นี่คือที่สำหรับใส่ไอคอน Safe & Sound */}
              <Image source={require('../../../../assets/logo/safe_and_sound_logo.png')} style={styles.logoIcon} />
            </View>
          </View>

          {/* App title with gradient */}
          <MaskedView
            style={styles.titleContainer}
            maskElement={
              <Text style={styles.titleMask}>
                Safe & Sound
              </Text>
            }
          >
            <LinearGradient
              colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
              locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTitle}
            >
              <Text style={styles.title}>
                Safe & Sound
              </Text>
            </LinearGradient>
          </MaskedView>

          {/* Sign In button */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate("SignIn")}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>SIGN IN</Text>
          </TouchableOpacity>

          <View style={{ paddingTop: 16 }}>
            <TouchableOpacity
                style={[
                  styles.signInButton,
                  { backgroundColor: '#008080', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 }
                ]}
                onPress={() => navigation.navigate('ElderInfoForm')}
                activeOpacity={0.8}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Elder Form Page</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingTop: 16 }}>
            <TouchableOpacity
                style={[
                  styles.signInButton,
                  { backgroundColor: '#008080', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 }
                ]}
                onPress={() => navigation.navigate('ElderInfoForm')}
                activeOpacity={0.8}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Elder Form Page</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}