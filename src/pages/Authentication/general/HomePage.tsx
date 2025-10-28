import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { styles } from '../../../global_style/style';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../App";
import NavBar, {
    HomeIcon,
    BellIcon,
    UserIcon,
    CogIcon,
    TabItem,
} from "../../../components/UI/NavBar";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const TAB_ROUTES: Record<string, keyof RootStackParamList> = {
    home: "Home",
    //bell: "Notifications",   // adjust to your route names
    //profile: "Profile",
    //settings: "Settings",
};

export default function Home({ navigation }: Props) {
    const [active, setActive] = useState("home");

    const tabs: TabItem[] = [
        { key: "home", label: "", icon: (p) => <HomeIcon {...p} /> },
        { key: "bell", label: "", icon: (p) => <BellIcon {...p} />, badgeCount: 1 },
        { key: "profile", label: "", icon: (p) => <UserIcon {...p} /> },
        { key: "settings", label: "", icon: (p) => <CogIcon {...p} /> },
    ];

    const handleTabPress = (k: string) => {
        setActive(k);
        const route = TAB_ROUTES[k];
        if (route && route !== "Home") navigation.navigate(route);
        // keep Home on the current screen
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1a202c' }}>
            {/* Content */}
            <View style={[styles.container, { paddingBottom: 96 }]}>
                <View style={styles.contentContainer}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoPlaceholder}>
                            <Image
                                source={require('../../../../assets/logo/safe_and_sound_logo.png')}
                                style={styles.logoIcon}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Title with gradient */}
                    <MaskedView
                        style={styles.titleContainer}
                        maskElement={<Text style={styles.titleMask}>Safe & Sound</Text>}
                    >
                        <LinearGradient
                            colors={['#383848', '#008080', '#1DA3A7', '#20A7B1', '#1C959D', '#178085', '#44B589']}
                            locations={[0, 0.38, 0.41, 0.45, 0.48, 0.72, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientTitle}
                        >
                            <Text style={styles.title}>Safe & Sound</Text>
                        </LinearGradient>
                    </MaskedView>

                    {/* Buttons */}
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => navigation.navigate("SignIn")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signInButtonText}>SIGN IN</Text>
                    </TouchableOpacity>

                    <View style={{ paddingTop: 16 }}>
                        <TouchableOpacity
                            style={[styles.signInButton, { backgroundColor: '#008080' }]}
                            onPress={() => navigation.navigate('ElderInfoForm')}
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
                                Elder Form Page
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingTop: 16 }}>
                        <TouchableOpacity
                            style={[styles.signInButton, { backgroundColor: '#008080' }]}
                            onPress={() => navigation.navigate('CaregiverInfoForm')}
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
                                Caregiver Form Page
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Bottom Nav (absolute) */}
            <NavBar
                tabs={tabs}
                activeKey={active}
                onTabPress={handleTabPress}
                activeColor="#0D5B60"
                inactiveColor="#808080"
                backgroundColor="#fff"
            />
        </SafeAreaView>
    );
}
