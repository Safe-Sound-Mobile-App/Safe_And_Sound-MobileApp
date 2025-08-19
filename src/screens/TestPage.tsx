import React from "react";
import { View, Text, Button } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "TestPage">;

export default function TestPage(_props: Props) {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
            <Text className="text-green-500" style={{ fontSize: 22, marginBottom: 16 }}>This is test page.</Text>
        </View>
    );
}
