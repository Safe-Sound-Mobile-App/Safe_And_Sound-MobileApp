import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    Pressable,
    Platform,
    useWindowDimensions,
} from "react-native";
import { styles } from "../../styles/elderInfoForm.styles";

export default function ElderInfoForm() {
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === "web" && width >= 1024;

    // local state (demo only)
    const [agree, setAgree] = useState(false);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, isDesktop && styles.cardDesktop]}>
                    {/* Back chevron (visual only here) */}
                    <Text style={styles.backChevron}>‹</Text>

                    {/* Title */}
                    <Text style={styles.title}>Elder Information</Text>

                    {/* First Name */}
                    <Row>
                        <IconBox>👤</IconBox>
                        <UnderlinedInput placeholder="First Name" required />
                    </Row>

                    {/* Last Name */}
                    <Row spacingTop={8}>
                        <Spacer />
                        <UnderlinedInput placeholder="Last Name" required />
                    </Row>

                    {/* Tel */}
                    <Row spacingTop={20}>
                        <IconBox>📞</IconBox>
                        <UnderlinedInput placeholder="Tel." keyboardType="phone-pad" />
                    </Row>

                    {/* Height & Weight (two columns) */}
                    <Row spacingTop={20}>
                        <IconBox>📏</IconBox>
                        <View style={styles.row2}>
                            <UnderlinedInput placeholder="Height (cm)" required />
                            <View style={{ width: 16 }} />
                            <UnderlinedInput placeholder="Weight (kg)" required />
                        </View>
                    </Row>

                    {/* Age (chip/dropdown look) */}
                    <Row spacingTop={20}>
                        <IconBox>📅</IconBox>
                        <Chip placeholder="Age (Year Old)" required />
                    </Row>

                    {/* Medical history */}
                    <Row spacingTop={24}>
                        <IconBox>➕</IconBox>
                        <MultilineBox placeholder="Medical history" />
                    </Row>

                    {/* Why text */}
                    <Row spacingTop={16} alignStart>
                        <IconBox>❓</IconBox>
                        <Text style={styles.infoText}>Why do we need to collect your information?</Text>
                    </Row>

                    {/* Consent checkbox */}
                    <Row spacingTop={12} alignStart>
                        <Check checked={agree} onToggle={() => setAgree(v => !v)} />
                        <Text style={styles.consentText}>
                            I agree to the collection and storage of my personal information in accordance with the{" "}
                            <Text style={styles.link}>Privacy Policy</Text>. <Text style={styles.requiredStar}>*</Text>
                        </Text>
                    </Row>

                    {/* Confirm button */}
                    <Pressable style={styles.cta} onPress={() => {}}>
                        <Text style={styles.ctaText}>Confirm</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* ------------------------ small building blocks ------------------------ */

function Row({
                 children,
                 spacingTop = 0,
                 alignStart = false,
             }: {
    children: React.ReactNode;
    spacingTop?: number;
    alignStart?: boolean;
}) {
    return (
        <View
            style={[
                styles.row,
                { marginTop: spacingTop },
                alignStart ? { alignItems: "flex-start" } : null,
            ]}
        >
            {children}
        </View>
    );
}

function IconBox({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.iconBox}>
            <Text style={styles.iconEmoji}>{children}</Text>
        </View>
    );
}

function Spacer() {
    return <View style={{ width: 44 }} />;
}

function UnderlinedInput({
                             placeholder,
                             required,
                             keyboardType,
                         }: {
    placeholder: string;
    required?: boolean;
    keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
}) {
    return (
        <View style={styles.underlineWrap}>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#9AA0A6"
                keyboardType={keyboardType}
                style={styles.underlineInput}
            />
            <View style={styles.underline} />
            {required && <Text style={styles.requiredStar}>*</Text>}
        </View>
    );
}

function Chip({ placeholder, required }: { placeholder: string; required?: boolean }) {
    return (
        <View style={styles.chipWrap}>
            <Text style={styles.chipText}>{placeholder}</Text>
            <Text style={styles.chipCaret}>▾</Text>
            {required && <Text style={[styles.requiredStar, styles.requiredOnChip]}>*</Text>}
        </View>
    );
}

function MultilineBox({ placeholder }: { placeholder: string }) {
    return (
        <View style={styles.multiWrap}>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#9AA0A6"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={styles.multiInput}
            />
        </View>
    );
}

function Check({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
    return (
        <Pressable onPress={onToggle} style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
        </Pressable>
    );
}
