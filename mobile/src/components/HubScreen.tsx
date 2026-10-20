import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    Image,
    StyleSheet,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Cloud, Shield, ChevronRight, Lock, User } from "lucide-react-native";
import { UserAvatar } from "./UserAvatar";
import { UserSession } from "../core/vault-storage";

interface HubScreenProps {
    theme: "dark" | "light";
    user: UserSession | null;
    onOpenTool: (tool: "pwmg" | "auth" | "profile") => void;
}

export function HubScreen({ theme, user, onOpenTool }: HubScreenProps) {
    const isLight = theme === "light";

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: isLight ? "#f8fafc" : "#090d16" },
            ]}
        >
            <ExpoStatusBar style={isLight ? "dark" : "light"} />

            {/* App Header */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: isLight ? "#ffffff" : "#090d16",
                        borderBottomColor: isLight ? "#e2e8f0" : "#1e293b",
                    },
                ]}
            >
                <View style={styles.brandRow}>
                    <Image
                        source={require("../../assets/snipit-logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text
                        style={[
                            styles.brandTitle,
                            { color: isLight ? "#0f172a" : "#ffffff" },
                        ]}
                    >
                        Snipit
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    {/* Top Sync Status Pill */}
                    <TouchableOpacity
                        style={[
                            styles.syncPill,
                            {
                                backgroundColor: isLight ? "#f1f5f9" : "#0f172a",
                                borderColor: isLight ? "#cbd5e1" : "#1e293b",
                            },
                        ]}
                        onPress={() => onOpenTool(user ? "profile" : "auth")}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.syncDot,
                                { backgroundColor: user?.token ? "#22c55e" : "#eab308" },
                            ]}
                        />
                        <Cloud color={user?.token ? "#3b82f6" : "#eab308"} size={12} />
                        <Text
                            style={[
                                styles.syncText,
                                { color: isLight ? "#475569" : "#94a3b8" },
                            ]}
                        >
                            {user?.token ? "Synced" : "Local"}
                        </Text>
                    </TouchableOpacity>

                    {/* Profile Button or Sign In Button */}
                    {user ? (
                        <TouchableOpacity
                            style={[
                                styles.profileBtn,
                                {
                                    backgroundColor: isLight ? "#eef2ff" : "rgba(124, 58, 237, 0.15)",
                                    borderColor: isLight ? "#c7d2fe" : "rgba(139, 92, 246, 0.3)",
                                },
                            ]}
                            onPress={() => onOpenTool("profile")}
                            activeOpacity={0.7}
                        >
                            <UserAvatar
                                uri={user.avatar}
                                name={user.username || "User"}
                                size={26}
                            />
                            <Text
                                style={[
                                    styles.profileBtnText,
                                    { color: isLight ? "#4f46e5" : "#c4b5fd" },
                                ]}
                            >
                                {user.username}
                            </Text>
                            <ChevronRight
                                color={isLight ? "#6366f1" : "#a78bfa"}
                                size={14}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.signInBtn}
                            onPress={() => onOpenTool("auth")}
                            activeOpacity={0.8}
                        >
                            <User color="#fff" size={14} />
                            <Text style={styles.signInBtnText}>Sign In</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Introduction */}
                <View style={styles.heroSection}>
                    <Text
                        style={[
                            styles.heroTitle,
                            { color: isLight ? "#0f172a" : "#f1f5f9" },
                        ]}
                    >
                        Select Tool
                    </Text>
                    <Text
                        style={[
                            styles.heroSubtitle,
                            { color: isLight ? "#64748b" : "#94a3b8" },
                        ]}
                    >
                        Direct access to Snipit's privacy-focused tools. Fast local performance with cloud account sync.
                    </Text>
                </View>

                {/* Primary Tool Cards */}
                <View style={styles.cardsContainer}>
                    {/* PWMG (Password Manager) Card */}
                    <TouchableOpacity
                        style={[
                            styles.card,
                            {
                                backgroundColor: isLight ? "#ffffff" : "#131b2e",
                                borderColor: isLight ? "#e2e8f0" : "rgba(139, 92, 246, 0.35)",
                                shadowOpacity: isLight ? 0.06 : 0.25,
                            },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => onOpenTool("pwmg")}
                    >
                        <View
                            style={[
                                styles.cardIconBox,
                                {
                                    backgroundColor: isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.2)",
                                },
                            ]}
                        >
                            <Shield color={isLight ? "#7c3aed" : "#a78bfa"} size={28} />
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeaderRow}>
                                <Text
                                    style={[
                                        styles.cardTitle,
                                        { color: isLight ? "#0f172a" : "#f1f5f9" },
                                    ]}
                                >
                                    Password Manager
                                </Text>
                                <View
                                    style={[
                                        styles.badge,
                                        {
                                            backgroundColor: isLight ? "rgba(124, 58, 237, 0.12)" : "rgba(124, 58, 237, 0.22)",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            { color: isLight ? "#6d28d9" : "#c4b5fd" },
                                        ]}
                                    >
                                        ZERO-KNOWLEDGE
                                    </Text>
                                </View>
                            </View>
                            <Text
                                style={[
                                    styles.cardDescription,
                                    { color: isLight ? "#64748b" : "#94a3b8" },
                                ]}
                            >
                                Zero-knowledge encrypted vault with 12-word recovery key, generator & master password.
                            </Text>
                        </View>
                        <ChevronRight color={isLight ? "#7c3aed" : "#a78bfa"} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Security note footer */}
                <View style={styles.securityFooter}>
                    <Lock color={isLight ? "#94a3b8" : "#64748b"} size={14} />
                    <Text
                        style={[
                            styles.securityFooterText,
                            { color: isLight ? "#94a3b8" : "#64748b" },
                        ]}
                    >
                        End-to-end encrypted with XSalsa20-Poly1305. Non-custodial security.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 8,
    },
    brandTitle: {
        fontSize: 20,
        fontWeight: "900",
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    syncPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    syncDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    syncText: {
        fontSize: 11,
        fontWeight: "700",
    },
    profileBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingLeft: 4,
        paddingRight: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    profileBtnText: {
        fontSize: 13,
        fontWeight: "700",
    },
    signInBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#7c3aed",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    signInBtnText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "700",
    },
    scrollContent: {
        padding: 20,
    },
    heroSection: {
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    heroSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    cardIconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
        marginRight: 8,
    },
    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    cardDescription: {
        fontSize: 12,
        lineHeight: 17,
    },
    securityFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 40,
        paddingHorizontal: 16,
    },
    securityFooterText: {
        fontSize: 12,
        textAlign: "center",
    },
});
