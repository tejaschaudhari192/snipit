import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Linking, Alert } from "react-native";
import { Download, CheckCircle2 } from "lucide-react-native";
import { CONFIG } from "../config/configuration";
import { useThemeVars } from "../config/theme";

interface UpdateModalProps {
    visible: boolean;
    updateResult: any;
    theme?: "dark" | "light";
    onClose: () => void;
}

export function UpdateInfoModal({ visible, updateResult, theme = "dark", onClose }: UpdateModalProps) {
    const vars = useThemeVars(theme);
    const isLight = theme === "light";

    if (!updateResult) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.updateModalContent,
                        {
                            backgroundColor: isLight ? "#ffffff" : "#131b2e",
                            borderColor: isLight ? "#e2e8f0" : "#1e293b",
                        },
                    ]}
                >
                    <View style={{ alignItems: "center", marginBottom: 16 }}>
                        <View
                            style={[
                                styles.updateIconCircle,
                                {
                                    backgroundColor: updateResult.isAvailable
                                        ? "rgba(168, 85, 247, 0.15)"
                                        : "rgba(34, 197, 94, 0.15)",
                                },
                            ]}
                        >
                            {updateResult.isAvailable ? (
                                <Download color="#a855f7" size={28} />
                            ) : (
                                <CheckCircle2 color="#22c55e" size={28} />
                            )}
                        </View>
                        <Text style={[styles.updateModalTitle, { color: vars.text }]}>
                            {updateResult.isAvailable ? "New Update Available!" : "You're on the Latest Version"}
                        </Text>
                        <Text style={[styles.updateModalVersion, { color: vars.textSecondary }]}>
                            Current: v{CONFIG.APP_VERSION}{" "}
                            {updateResult.latestVersion ? `• Latest: v${updateResult.latestVersion}` : ""}
                        </Text>
                    </View>

                    {updateResult.isAvailable && updateResult.changelog && updateResult.changelog.length > 0 && (
                        <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
                            <Text style={[styles.changelogHeader, { color: vars.textSecondary }]}>WHAT'S NEW</Text>
                            {updateResult.changelog.map((entry: any, idx: number) => (
                                <View key={idx} style={{ marginBottom: 12 }}>
                                    <Text style={[styles.changelogTitle, { color: vars.text }]}>
                                        v{entry.version} {entry.title ? `- ${entry.title}` : ""}
                                    </Text>
                                    {entry.changes?.map((change: string, cIdx: number) => (
                                        <Text key={cIdx} style={[styles.changelogItem, { color: vars.textSecondary }]}>
                                            • {change}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.modalSecondaryBtn, { borderColor: isLight ? "#e2e8f0" : "#334155" }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.modalSecondaryBtnText, { color: vars.text }]}>Close</Text>
                        </TouchableOpacity>

                        {updateResult.isAvailable && updateResult.downloadUrl && (
                            <TouchableOpacity
                                style={[styles.modalPrimaryBtn, { backgroundColor: vars.purple }]}
                                onPress={() => {
                                    Linking.openURL(updateResult.downloadUrl).catch(() => {
                                        Alert.alert("Error", "Could not open download link.");
                                    });
                                }}
                            >
                                <Download color="#fff" size={16} style={{ marginRight: 6 }} />
                                <Text style={styles.modalPrimaryBtnText}>Download APK</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    updateModalContent: {
        width: "100%",
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
    },
    updateIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    updateModalTitle: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    updateModalVersion: {
        fontSize: 13,
        marginTop: 4,
        textAlign: "center",
    },
    changelogHeader: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    changelogTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    changelogItem: {
        fontSize: 13,
        lineHeight: 18,
    },
    modalSecondaryBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalSecondaryBtnText: {
        fontSize: 14,
        fontWeight: "600",
    },
    modalPrimaryBtn: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    modalPrimaryBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
});
