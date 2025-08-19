import React from "react";
import { FlatList, Image, Platform, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../ui/useResponsive";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "NewPage">;

const DATA = Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1), title: `Card ${i + 1}` }));

export default function NewPage(_props: Props) {
    const insets = useSafeAreaInsets();
    const { columns, ms, isAndroid, isTablet, isLandscape } = useResponsive();

    return (
        <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
            <FlatList
                data={DATA}
                keyExtractor={(item) => item.id}
                key={columns}
                numColumns={columns}
                contentContainerStyle={{ padding: ms(16), gap: ms(16) }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {}}
                        android_ripple={{ borderless: false }}
                        style={({ pressed }) => [
                            styles.card,
                            { padding: ms(14), opacity: pressed && !isAndroid ? 0.7 : 1 },
                        ]}
                    >
                        <Image
                            source={{ uri: "https://picsum.photos/800/500" }}
                            style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: ms(12) }}
                        />
                        <Text style={{ fontSize: ms(18), marginTop: ms(8), fontWeight: "600" }}>
                            {item.title} {isTablet ? "• Tablet" : ""} {isLandscape ? "• Landscape" : ""}
                        </Text>
                        <Text style={{ fontSize: ms(14), marginTop: ms(4) }}>
                            Fully responsive card using % widths and aspectRatio.
                        </Text>
                    </Pressable>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: "#fff",
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 4 },
        }),
    },
});
