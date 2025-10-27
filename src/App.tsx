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
import CaregiverSetting from "./pages/Main/caregiver/caregiverSetting";

// Modal screens (no navbar)
import AddNewElder from "./pages/Main/caregiver/addNewElder";

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
  
  // Tab Screens
  CaregiverHomepage: undefined;
  Notification: undefined;
  Account: undefined;
  CaregiverSetting: undefined;
  ElderProfile: { elderId: string };
  Chat: { elderId: string };
  ElderInformation: { elderId: string };
  
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
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="CaregiverSetting" component={CaregiverSetting} />
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

        {/* Modal/Full-screen pages - NO NAVBAR */}
        <Stack.Screen
          name="AddNewElder"
          component={AddNewElder}
          options={{
            presentation: 'card', // or 'modal' for slide up animation
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}