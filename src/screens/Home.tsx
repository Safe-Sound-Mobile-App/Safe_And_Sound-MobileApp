import React from "react";
import { View, Text, Button } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home({ navigation }: Props) {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
            <Text style={{ fontSize: 22, marginBottom: 16 }}>Home</Text>
            <Button title="Open New Page" onPress={() => navigation.navigate("NewPage")} />
            <Button title="Open Test Page" onPress={() => navigation.navigate("TestPage")} />
        </View>
    );
}
