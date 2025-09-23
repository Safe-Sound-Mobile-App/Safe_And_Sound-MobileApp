import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./pages/Authentication/general/HomePage";
import SignIn from "./pages/Authentication/general/SignIn";
import SignUp from "./pages/Authentication/general/SignUp";
import RoleSelection from "./pages/Authentication/general/RoleSelection";
import ForgotPassword from "./pages/Authentication/general/ForgotPassword";
import NewPassword from "./pages/Authentication/general/NewPassword";
import ElderInfoForm from "./pages/Authentication/elder/ElderInfoForm";
import CaregiverInfoForm from "./pages/Authentication/caregiver/CaregiverInfoForm";

import CaregiverHomepage from "./pages/Main/caregiver/caregiverHomePage";

export type RootStackParamList = {
  Home: undefined;
  SignIn: undefined;
  SignUp: undefined;
  RoleSelection: undefined;
  ForgotPassword: undefined;
  NewPassword: { token: string};
  ElderInfoForm: undefined;
  CaregiverInfoForm: undefined;
  CaregiverHomepage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
    prefixes: [], // optional
    config: {
        screens: {
            Home: "",           // This maps to "/"
            SignIn: "SignIn",     // This maps to "/new"
            SignUp: "SignUp",
            RoleSelection: "RoleSelection", // This maps to "/edit/:id"
            ForgotPassword: "ForgotPassword",
            NewPassword: "NewPassword", // This maps to "/edit/:id"
            ElderInfoForm: "ElderInfoForm",
            CaregiverInfoForm: "CaregiverInfoForm",
            CaregiverHomepage: "CaregiverHomepage",
        },
    },
};


export default function App() {
    // @ts-ignore
    return (
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // ซ่อน header bar สำหรับทุก screen
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="RoleSelection" component={RoleSelection} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="NewPassword" component={NewPassword} />
          <Stack.Screen name="ElderInfoForm" component={ElderInfoForm} />
          <Stack.Screen name="CaregiverInfoForm" component={CaregiverInfoForm} />
          <Stack.Screen name="CaregiverHomepage" component={CaregiverHomepage} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}