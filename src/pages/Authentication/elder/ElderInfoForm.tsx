// app/screens/auth/ElderInfoForm.tsx
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
import { styles } from "../../../global_style/elderInfoForm.styles";

type Props = { navigation: any };

export default function ElderInfoForm({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    // form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [tel, setTel] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [age, setAge] = useState("");
    const [medicalHistory, setMedicalHistory] = useState("");

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

    // ---------------- VALIDATION ----------------
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
        height:
            touched.height && !height.trim()
                ? "Height is required"
                : touched.height &&
                (!/^\d+$/.test(height) || Number(height) < 50 || Number(height) > 260)
                    ? "Enter valid height (50–260 cm)"
                    : "",
        weight:
            touched.weight && !weight.trim()
                ? "Weight is required"
                : touched.weight &&
                (!/^\d+(\.\d+)?$/.test(weight) ||
                    Number(weight) < 10 ||
                    Number(weight) > 400)
                    ? "Enter valid weight (10–400 kg)"
                    : "",
        age:
            touched.age && !age.trim()
                ? "Age is required"
                : touched.age &&
                (!/^\d+$/.test(age) || Number(age) < 1 || Number(age) > 120)
                    ? "Enter valid age (1–120)"
                    : "",
        agree: !agree ? "Consent required" : "",
    };

    const canSubmit =
        firstName.trim() &&
        lastName.trim() &&
        height.trim() &&
        weight.trim() &&
        age.trim() &&
        !errors.firstName &&
        !errors.lastName &&
        !errors.height &&
        !errors.weight &&
        !errors.age &&
        agree;

    const onConfirm = () => {
        if (!canSubmit) return;
        const payload = {
            firstName,
            lastName,
            tel,
            height: Number(height),
            weight: parseFloat(weight),
            age: Number(age),
            medicalHistory,
        };
        console.log("Submitting:", payload);
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
                        <Text style={styles.title}>Elder Information</Text>

                        <Field
                            label="First Name"
                            value={firstName}
                            onChangeText={(t) => setFirstName(t.replace(/[^a-zA-Z\s]/g, ""))}
                            onBlur={() => markTouched("firstName")}
                            required
                            error={errors.firstName}
                        />
                        <Field
                            label="Last Name"
                            value={lastName}
                            onChangeText={(t) => setLastName(t.replace(/[^a-zA-Z\s]/g, ""))}
                            onBlur={() => markTouched("lastName")}
                            required
                            error={errors.lastName}
                        />
                        <Field
                            label="Tel."
                            value={tel}
                            onChangeText={(t) =>
                                setTel(t.replace(/[^0-9+\-() ]/g, "")) // digits + basic phone symbols
                            }
                            keyboardType="phone-pad"
                        />

                        <View style={styles.row}>
                            <Field
                                label="Height (cm)"
                                value={height}
                                onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, ""))}
                                onBlur={() => markTouched("height")}
                                keyboardType="numeric"
                                required
                                error={errors.height}
                                style={styles.half}
                            />
                            <Field
                                label="Weight (kg)"
                                value={weight}
                                onChangeText={(t) =>
                                    setWeight(
                                        t.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                                    )
                                }
                                onBlur={() => markTouched("weight")}
                                keyboardType="numeric"
                                required
                                error={errors.weight}
                                style={styles.half}
                            />
                        </View>

                        <Field
                            label="Age (Years)"
                            value={age}
                            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
                            onBlur={() => markTouched("age")}
                            keyboardType="numeric"
                            required
                            error={errors.age}
                        />

                        <Field
                            label="Medical history"
                            value={medicalHistory}
                            onChangeText={setMedicalHistory}
                            multiline
                            numberOfLines={3}
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

                        {/* Confirm button */}
                        <TouchableOpacity
                            onPress={onConfirm}
                            disabled={!canSubmit}
                            style={[styles.confirmBtn, !canSubmit && { opacity: 0.5 }]}
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
                            We collect this information to personalize care and provide better
                            services.
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
                        {/* Header row with title and X */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    // ⬇️ If the user checked the box, consent becomes true; otherwise false
                                    setAgree(modalAgree);
                                    setPolicyVisible(false);
                                }}
                            >
                                <CloseIcon size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalTitle}>Privacy Policy</Text>
                        <ScrollView style={{ marginVertical: 10 }}>
                            <Text style={[styles.modalBody, { textAlign: "center" }]}>
                                We value your privacy and commit to secure handling of your
                                personal data...
                            </Text>
                        </ScrollView>
                        <View style={styles.consentWrapper}>
                            <Pressable
                                onPress={() => setModalAgree(!modalAgree)}
                                style={[styles.consentRow, { marginVertical: 10 }]}
                            >
                                <View
                                    style={[styles.checkbox, modalAgree && styles.checkboxChecked]}
                                >
                                    {modalAgree && (
                                        <CheckIcon size={16} color="#fff" />
                                    )}
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
                            style={[styles.modalBtnSmall, !modalAgree && { opacity: 0.5 }]}
                        >
                            <Text style={styles.modalBtnText}>Agree</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function HelpIcon({ size = 20, color = "#6b7280" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
            <Path
                d="M9.5 9.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 4"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
            />
            <Circle cx="12" cy="17" r="1" fill={color} />
        </Svg>
    );
}

function CheckIcon({ size = 16, color = "#fff" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M5 13l4 4L19 7"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function CloseIcon({ size = 24, color = "#111827" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M6 6L18 18M6 18L18 6"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
            />
        </Svg>
    );
}


/* ------------ Reusable Field ------------ */
function Field({ label, value, onChangeText, onBlur, style, error, ...props }: any) {
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


