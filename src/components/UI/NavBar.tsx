// components/UI/NavBar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    SafeAreaView,
    LayoutChangeEvent,
    Animated,
    Easing,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

/* Icons (unchanged) */
export const HomeIcon = ({ size = 24, color = "#111" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 10.5l9-7 9 7V20a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-9.5z"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
        />
    </Svg>
);
export const BellIcon = ({ size = 24, color = "#111" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M18 9a6 6 0 10-12 0c0 7-3 6-3 8h18c0-2-3-1-3-8z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path d="M10 20a2 2 0 004 0" stroke={color} strokeWidth={2} />
    </Svg>
);
export const UserIcon = ({ size = 24, color = "#111" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
        <Path
            d="M4 20c1.8-3.5 6-4 8-4s6.2.5 8 4"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
        />
    </Svg>
);
export const CogIcon = ({ size = 24, color = "#111" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 01-.1 1l2 1.5-2 3.5-2.3-.9a7.2 7.2 0 01-1.7 1L14.8 21h-5.6l-.5-2.4a7.2 7.2 0 01-1.7-1l-2.3.9-2-3.5 2-1.5a7.4 7.4 0 010-2L.7 9l2-3.5 2.3.9a7.2 7.2 0 011.7-1L9.2 3h5.6l.5 2.4a7.2 7.2 0 011.7 1l2.3-.9 2 3.5-2 1.5c.1.3.1.7.1 1z"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
        />
    </Svg>
);

export type TabItem = {
    key: string;
    label?: string;
    icon: (opts: { size: number; color: string }) => React.ReactNode;
    badgeCount?: number;
    accessibilityLabel?: string;
};

type Props = {
    tabs: TabItem[];
    activeKey: string;
    onTabPress: (key: string) => void;
    barColor?: string;
    inactiveColor?: string;
    activeIconColor?: string;
    sliderColor?: string;
    ringColor?: string;
    sliderSize?: number;
    activeScale?: number;
    durationMs?: number;
    yOffset?: number; // optional vertical nudge
};

export default function NavBar({
                                   tabs,
                                   activeKey,
                                   onTabPress,
                                   /* ✅ teal-theme defaults */
                                   barColor = "#0F1B24",
                                   inactiveColor = "#A5B0BB",
                                   activeIconColor = "#FFFFFF",
                                   sliderColor = "#178085",
                                   ringColor = "rgba(0,128,128,0.8)",
                                   sliderSize = 64,
                                   activeScale = 1.08,
                                   durationMs = 380,
                                   yOffset = -10,
                               }: Props) {
    // Keep this in sync with styles.bar.paddingHorizontal
    const HPAD = 18;

    const [barWidth, setBarWidth] = useState(0);
    const [barHeight, setBarHeight] = useState(0);

    const count = tabs.length;
    const innerWidth = Math.max(0, barWidth - HPAD * 2);
    const slotWidth = innerWidth > 0 ? innerWidth / count : 0;

    const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === activeKey));

    const x = useRef(new Animated.Value(activeIndex)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(x, {
            toValue: activeIndex,
            duration: durationMs,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();

        Animated.sequence([
            Animated.timing(scale, {
                toValue: activeScale,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();
    }, [activeIndex]);

    const translateX = useMemo(() => {
        if (!slotWidth) return new Animated.Value(0);
        return x.interpolate({
            inputRange: Array.from({ length: count }, (_, i) => i),
            // Start at left content edge (HPAD), then step by slotWidth
            outputRange: Array.from(
                { length: count },
                (_, i) => HPAD + i * slotWidth + (slotWidth - sliderSize) / 2
            ),
        });
    }, [x, count, slotWidth, sliderSize]);

    const centerY = barHeight / 2 - sliderSize / 2 + yOffset;

    const onLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setBarWidth(width);
        setBarHeight(height);
    };

    return (
        <SafeAreaView pointerEvents="box-none" style={styles.safe}>
            <View onLayout={onLayout} style={[styles.bar, { backgroundColor: barColor }]}>
                {/* Sliding button */}
                {barWidth > 0 && (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.sliderWrap,
                            {
                                width: sliderSize,
                                height: sliderSize,
                                borderRadius: sliderSize / 2,
                                transform: [{ translateX }, { translateY: centerY }],
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.ring,
                                {
                                    width: sliderSize + 10,
                                    height: sliderSize + 10,
                                    borderRadius: (sliderSize + 10) / 2,
                                    backgroundColor: ringColor,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[styles.slider, { backgroundColor: sliderColor, transform: [{ scale }] }]}
                        >
                            {tabs[activeIndex]?.icon({ size: 26, color: activeIconColor })}
                        </Animated.View>
                    </Animated.View>
                )}

                {/* Tabs row */}
                <View style={[styles.row, { justifyContent: "flex-start" }]}>
                    {tabs.map((t, i) => {
                        const active = i === activeIndex;
                        return (
                            <View
                                key={t.key}
                                style={[
                                    styles.slot,
                                    { width: slotWidth || undefined, flex: slotWidth ? undefined : 1 },
                                ]}
                            >
                                <TouchableOpacity
                                    onPress={() => onTabPress(t.key)}
                                    activeOpacity={0.9}
                                    style={styles.hit}
                                    accessibilityRole="button"
                                    accessibilityLabel={t.accessibilityLabel ?? t.label ?? t.key}
                                >
                                    {!active && (
                                        <>
                                            {t.icon({ size: 24, color: inactiveColor })}
                                            {!!t.badgeCount && (
                                                <View style={styles.badge}>
                                                    <Text style={styles.badgeTxt}>
                                                        {t.badgeCount > 9 ? "9+" : t.badgeCount}
                                                    </Text>
                                                </View>
                                            )}
                                        </>
                                    )}
                                </TouchableOpacity>
                                {!!t.label && (
                                    <Text
                                        style={[
                                            styles.label,
                                            { color: active ? "#20A7B1" : "#9FB2BF" },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {t.label}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { position: "absolute", left: 0, right: 0, bottom: 0 },
    bar: {
        marginHorizontal: 14,
        marginBottom: 10,
        paddingHorizontal: 18, // ← keep in sync with HPAD
        paddingVertical: 12,
        borderRadius: 22,
        overflow: "visible",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.18,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
            },
            android: { elevation: 12 },
            default: {},
        }),
    },
    row: { flexDirection: "row", alignItems: "center" },
    slot: { alignItems: "center" },
    hit: { paddingVertical: 10, alignItems: "center", justifyContent: "center", minHeight: 44 },
    label: { marginTop: 6, fontSize: 12, fontWeight: "700" },

    sliderWrap: { position: "absolute", left: 0, top: 0, alignItems: "center", justifyContent: "center" },
    ring: { position: "absolute" },
    slider: {
        width: "100%",
        height: "100%",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
            },
            android: { elevation: 8 },
            default: {},
        }),
    },

    badge: {
        position: "absolute",
        top: 4,
        right: 14, // slightly less than padding so the bell’s centroid stays visually centered
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
    },
    badgeTxt: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
