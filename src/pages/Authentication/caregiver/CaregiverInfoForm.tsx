// app/screens/auth/CaregiverInfoForm.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Pressable,
    Modal,
    useWindowDimensions,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { styles } from "../../../global_style/caregiverInfoForm.styles";

// ---------- SVG Icons ----------
function HelpIcon({ size = 20, color = "#6b7280" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
            <Path d="M9.5 9.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
            <Circle cx="12" cy="17" r="1" fill={color} />
        </Svg>
    );
}
function CheckIcon({ size = 16, color = "#fff" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function CloseIcon({ size = 24, color = "#111827" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6L18 18M6 18L18 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

// ---------- Reusable Field ----------
function Field({
                   label,
                   value,
                   onChangeText,
                   onBlur,
                   style,
                   error,
                   ...props
               }: any) {
    return (
        <View style={[{ marginBottom: 16 }, style]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    error ? { borderColor: "#ef4444" } : { borderColor: "#e5e7eb" },
                ]}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                placeholder={label}
                placeholderTextColor="#9ca3af"
                {...props}
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

type Props = { navigation: any };

export default function CaregiverInfoForm({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    // form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName]   = useState("");
    const [tel, setTel]             = useState("");

    // touched tracker
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // consent
    const [agree, setAgree] = useState(false);
    const [modalAgree, setModalAgree] = useState(false);

    // modals
    const [infoVisible, setInfoVisible] = useState(false);
    const [policyVisible, setPolicyVisible] = useState(false);

    const markTouched = (field: string) =>
        setTouched((t) => ({ ...t, [field]: true }));

    // -------- Validation (same behavior as ElderInfoForm) --------
    const errors = {
        firstName:
            touched.firstName && !firstName.trim()
                ? "First name is required"
                : touched.firstName && !/^[a-zA-Z\s]+$/.test(firstName)
                    ? "Only letters allowed"
                    : "",
        lastName:
            touched.lastName && !lastName.trim()
                ? "Last name is required"
                : touched.lastName && !/^[a-zA-Z\s]+$/.test(lastName)
                    ? "Only letters allowed"
                    : "",
        // Tel is optional in the screenshot; add format check only if provided
        tel:
            touched.tel && tel && !/^[0-9+\-() ]+$/.test(tel)
                ? "Invalid phone format"
                : "",
        agree: !agree ? "Consent required" : "",
    };

    const canSubmit =
        firstName.trim() &&
        lastName.trim() &&
        !errors.firstName &&
        !errors.lastName &&
        !errors.tel &&
        agree;

    const onConfirm = () => {
        if (!canSubmit) return;
        const payload = { firstName, lastName, tel };
        console.log("Submitting Caregiver:", payload);
        // navigation.navigate("NextScreen");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.select({ ios: "padding", android: undefined })}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingHorizontal: isDesktop ? 40 : 20 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[styles.card, { maxWidth: isDesktop ? 720 : "100%" }]}>
                        <Text style={styles.title}>Caregiver</Text>

                        <Field
                            label="First Name"
                            value={firstName}
                            onChangeText={(t: string) => setFirstName(t.replace(/[^a-zA-Z\s]/g, ""))}
                            onBlur={() => markTouched("firstName")}
                            required
                            error={errors.firstName}
                        />

                        <Field
                            label="Last Name"
                            value={lastName}
                            onChangeText={(t: string) => setLastName(t.replace(/[^a-zA-Z\s]/g, ""))}
                            onBlur={() => markTouched("lastName")}
                            required
                            error={errors.lastName}
                        />

                        <Field
                            label="Tel."
                            value={tel}
                            onChangeText={(t: string) => setTel(t.replace(/[^0-9+\-() ]/g, ""))}
                            onBlur={() => markTouched("tel")}
                            keyboardType="phone-pad"
                            error={errors.tel}
                        />

                        {/* Why link */}
                        <Pressable onPress={() => setInfoVisible(true)} style={styles.centerRow}>
                            <HelpIcon size={20} color="#6b7280" />
                            <Text style={styles.linkText}>
                                Why do we need to collect your information?
                            </Text>
                        </Pressable>

                        {/* Consent row */}
                        <View style={styles.consentWrapper}>
                            <Pressable onPress={() => setPolicyVisible(true)} style={styles.consentRow}>
                                <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                                    {agree && <CheckIcon size={16} color="#fff" />}
                                </View>
                                <Text style={styles.consentText}>
                                    I agree in accordance with the{" "}
                                    <Text style={styles.consentLink}>Privacy Policy</Text>.
                                </Text>
                                <Text style={styles.requiredStar}>*</Text>
                            </Pressable>
                            {!!errors.agree && !agree && (
                                <Text style={styles.errorTextCentered}>{errors.agree}</Text>
                            )}
                        </View>

                        {/* Confirm (always visible, greyed out until valid) */}
                        <TouchableOpacity
                            onPress={onConfirm}
                            disabled={!canSubmit}
                            style={[
                                styles.confirmBtn,
                                !canSubmit && { backgroundColor: "#9ca3af" },
                            ]}
                        >
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Info Modal */}
            <Modal visible={infoVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Information Collection</Text>
                        <Text style={[styles.modalBody, { textAlign: "center" }]}>
                            We collect this information to personalize care and provide better services.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setInfoVisible(false)}
                            style={styles.modalBtnSmall}
                        >
                            <Text style={styles.modalBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Privacy Policy Modal */}
            <Modal visible={policyVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBoxLarge}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    setAgree(modalAgree); // X applies current checkbox state
                                    setPolicyVisible(false);
                                }}
                            >
                                <CloseIcon size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalTitle}>Privacy Policy</Text>
                        <ScrollView style={{ marginVertical: 10, alignSelf: "stretch" }}>
                            <Text style={[styles.modalBody, { textAlign: "center" }]}>
                                We value your privacy and commit to secure handling of your personal data...
                            </Text>
                        </ScrollView>
                        <View style={styles.consentWrapper}>
                            <Pressable
                                onPress={() => setModalAgree((v) => !v)}
                                style={styles.consentRow}
                            >
                                <View style={[styles.checkbox, modalAgree && styles.checkboxChecked]}>
                                    {modalAgree && <CheckIcon size={16} color="#fff" />}
                                </View>
                                <Text style={styles.consentText}>I have read and agree</Text>
                            </Pressable>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (modalAgree) {
                                    setAgree(true);
                                    setPolicyVisible(false);
                                }
                            }}
                            disabled={!modalAgree}
                            style={[
                                styles.modalBtnSmall,
                                !modalAgree && { opacity: 0.5 },
                            ]}
                        >
                            <Text style={styles.modalBtnText}>Agree</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
