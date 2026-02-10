import * as React from "react";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import BottomNavbar from "./navigation/BottomNavbar";
import auth from "@react-native-firebase/auth";
import { getUserProfile } from "./services/firestore";

// Authentication screens (no navbar)
import Home from "./pages/Authentication/general/HomePage";
import SignIn from "./pages/Authentication/general/SignIn";
import SignUp from "./pages/Authentication/general/SignUp";
import RoleSelection from "./pages/Authentication/general/RoleSelection";
import ForgotPassword from "./pages/Authentication/general/ForgotPassword";
import NewPassword from "./pages/Authentication/general/NewPassword";
import ElderInfoForm from "./pages/Authentication/elder/ElderInfoForm";
import CaregiverInfoForm from "./pages/Authentication/caregiver/CaregiverInfoForm";

// Main screens (with navbar)
import CaregiverHomepage from "./pages/Main/caregiver/caregiverHomePage";
import CaregiverNotification from "./pages/Main/caregiver/caregiverNotification";
import CaregiverProfile from "./pages/Main/caregiver/caregiverProfile";
import CaregiverSetting from "./pages/Main/caregiver/caregiverSetting";
import CaregiverEditProfile from "./pages/Main/caregiver/caregiverEditProfile";

// Elder
import ElderHomePage from "./pages/Main/elder/elderHomePage";
import ElderNotification from "./pages/Main/elder/elderNotificationPage";
import ElderProfile from "./pages/Main/elder/elderProfilePage";
import ElderSetting from "./pages/Main/elder/elderSettingPage";

// Modal screens (no navbar)
import AddNewElder from "./pages/Main/caregiver/addNewElder";
import caregiverEditProfile from "./pages/Main/caregiver/caregiverEditProfile";
import elderEditProfile from "./pages/Main/elder/elderEditProfile";
import CaregiverChat from "./pages/Main/caregiver/caregiverChat";
import CaregiverElderInfo from "./pages/Main/caregiver/caregiverElderInfo";

export type RootStackParamList = {
  // Authentication Stack
  Home: undefined;
  SignIn: undefined;
  SignUp: undefined;
  RoleSelection: undefined;
  ForgotPassword: undefined;
  NewPassword: { token: string };
  ElderInfoForm: undefined;
  CaregiverInfoForm: undefined;
  
  // Main App
  MainTabs: undefined;
  ElderMainTabs: undefined;
  
  // Tab Screens
  CaregiverHomepage: undefined;
  ElderHomepage: undefined;
  Notification: undefined;
  Account: undefined;
  CaregiverSetting: undefined;
  ElderProfile: { elderId: string };
  Chat: { elderId: string };
  ElderInformation: { elderId: string };
  ElderSetting: { elderId: string };

  // EditProfile: { profile: UserProfile };
  caregiverEditProfile: { profile: any };
  elderEditProfile: { profile: any };
  
  // Modal Screens
  AddNewElder: undefined;
  caregiverChat: { elderId: string; elderName: string};
  caregiverElderInfo: { elderId: string };
};

export type MainTabParamList = {
  CaregiverHomepage: undefined;
  Notification: undefined;
  Account: undefined;
  CaregiverSetting: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: "",
      SignIn: "SignIn",
      SignUp: "SignUp",
      RoleSelection: "RoleSelection",
      ForgotPassword: "ForgotPassword",
      NewPassword: "NewPassword",
      ElderInfoForm: "ElderInfoForm",
      CaregiverInfoForm: "CaregiverInfoForm",
      MainTabs: {
        path: "main",
        screens: {
          CaregiverHomepage: "home",
          Notification: "notification",
          Account: "account",
          CaregiverSetting: "settings",
        },
      },
      AddNewElder: "AddNewElder",
      caregiverEditProfile: "caregiverEditProfile",
    },
  },
};

// Placeholder screens for unimplemented tabs
function NotificationScreen() {
  return null;
}

function AccountScreen() {
  return null;
}

// Tab Navigator with Bottom Navbar (for main app screens)
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavbar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="CaregiverHomepage" component={CaregiverHomepage} />
      <Tab.Screen name="Notification" component={CaregiverNotification} />
      <Tab.Screen name="Account" component={CaregiverProfile} />
      <Tab.Screen name="CaregiverSetting" component={CaregiverSetting} />
    </Tab.Navigator>
  );
}

// Elder Tab
function ElderMainTabs() {
  return (
      <Tab.Navigator
          tabBar={(props) => <BottomNavbar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
      >
        <Tab.Screen name="ElderHomepage" component={ElderHomePage} />
        <Tab.Screen name="ElderNotification" component={ElderNotification} />
        <Tab.Screen name="ElderAccount" component={ElderProfile} />
        <Tab.Screen name="ElderSetting" component={ElderSetting} />
      </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User is logged in, check their profile
        const profileResult = await getUserProfile(firebaseUser.uid);
        
        if (profileResult.success && profileResult.data) {
          setUserRole(profileResult.data.role);
        } else {
          setUserRole(null);
        }
      } else {
        // User is logged out
        setUserRole(null);
      }

      if (initializing) setInitializing(false);
    });

    return subscriber; // unsubscribe on unmount
  }, []);

  // Show loading screen while checking auth state
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  // Determine initial route based on auth state
  const getInitialRouteName = () => {
    if (user && userRole === 'elder') {
      return 'ElderMainTabs';
    } else if (user && userRole === 'caregiver') {
      return 'MainTabs';
    } else if (user && !userRole) {
      return 'RoleSelection';
    } else {
      return 'Home';
    }
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Authentication Screens - NO NAVBAR */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="RoleSelection" component={RoleSelection} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="NewPassword" component={NewPassword} />
        <Stack.Screen name="ElderInfoForm" component={ElderInfoForm} />
        <Stack.Screen name="CaregiverInfoForm" component={CaregiverInfoForm} />

        {/* Main App with Tabs - HAS NAVBAR */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ElderMainTabs" component={ElderMainTabs} />

        {/* Modal/Full-screen pages - NO NAVBAR */}
        <Stack.Screen name="AddNewElder" component={AddNewElder} options={{ presentation: 'card'}}/>
        <Stack.Screen name="caregiverEditProfile" component={caregiverEditProfile} options={{ presentation: 'card'}}/>
        <Stack.Screen name="elderEditProfile" component={elderEditProfile} options={{ presentation: 'card'}}/>
        <Stack.Screen name="caregiverChat" component={CaregiverChat} options={{ presentation: 'card'}}/>
        <Stack.Screen name="caregiverElderInfo" component={CaregiverElderInfo} options={{ presentation: 'card'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}