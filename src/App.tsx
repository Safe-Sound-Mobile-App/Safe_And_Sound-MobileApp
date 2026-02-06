import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomNavbar from "./navigation/BottomNavbar";

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
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}