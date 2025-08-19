import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home";
import NewPage from "./screens/NewPage";
import TestPage from "./screens/TestPage";

export type RootStackParamList = {
  Home: undefined;
  NewPage: undefined;
  TestPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
    prefixes: [], // optional
    config: {
        screens: {
            Home: "",           // This maps to "/"
            NewPage: "new",     // This maps to "/new"
            TestPage: "test",
        },
    },
};


export default function App() {
    // @ts-ignore
    return (
      <NavigationContainer linking={linking}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="NewPage" component={NewPage} />
          <Stack.Screen name="TestPage" component={TestPage} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
