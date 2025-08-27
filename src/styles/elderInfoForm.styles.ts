import {Platform, StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    title: {
        fontFamily: "BalooBhaijaan2_700Bold",
        fontSize: 34,
        fontWeight: "800",
        color: "#111111",
        marginTop: 36,
        marginBottom: 24,
    },
    body: {
        fontSize: 16,
    },
    safe: { flex: 1, backgroundColor: "#FFFFFF" },
    scrollContent: {
        paddingBottom: 32,
    },
    card: {
        width: "100%",
        maxWidth: 460,            // keeps mobile look on big screens
        alignSelf: "center",
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    cardDesktop: {
        paddingTop: 32,
    },

    backChevron: {
        fontSize: 28,
        color: "#111",
        marginTop: 4,
        marginBottom: 8,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: "#F2F2F2",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    iconEmoji: { fontSize: 20 },

    underlineWrap: {
        flex: 1,
        position: "relative",
        paddingRight: 20,
    },
    underlineInput: {
        paddingVertical: 10,
        fontSize: 16,
        color: "#111",
    },
    underline: {
        height: 1.25,
        backgroundColor: "#CFCFCF",
        marginTop: 4,
    },
    requiredStar: {
        position: "absolute",
        right: 4,
        top: 0,
        color: "#F43F5E", // red-ish
        fontWeight: "700",
    },

    row2: { flex: 1, flexDirection: "row", alignItems: "flex-end" },

    chipWrap: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        position: "relative",
    },
    chipText: {
        fontSize: 16,
        color: "#6B7280",
        flex: 1,
    },
    chipCaret: {
        fontSize: 16,
        color: "#6B7280",
        marginLeft: 8,
    },
    requiredOnChip: {
        position: "absolute",
        right: 8,
        top: -10,
    },

    multiWrap: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    multiInput: {
        minHeight: 120,
        fontSize: 16,
        color: "#111",
    },

    infoText: {
        fontSize: 15,
        color: "#6B7280",
    },

    consentText: {
        flex: 1,
        fontSize: 15,
        color: "#4B5563",
        lineHeight: 20,
    },
    link: {
        color: "#0891B2",
        fontWeight: "700",
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1.6,
        borderColor: "#9CA3AF",
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: "#111",
        borderColor: "#111",
    },
    checkboxTick: {
        color: "#fff",
        fontSize: 14,
        lineHeight: 14,
    },

    cta: {
        alignSelf: "center",
        marginTop: 24,
        backgroundColor: "#2B2B2B",
        paddingVertical: 14,
        paddingHorizontal: 36,
        borderRadius: 28,
        minWidth: 220,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        ...Platform.select({ android: { elevation: 4 } }),
    },
    ctaText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 18,
        letterSpacing: 0.3,
    },
});