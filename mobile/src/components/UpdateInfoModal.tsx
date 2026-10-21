import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Linking } from "react-native";
import { Download, CheckCircle2 } from "lucide-react-native";
import { CONFIG } from "../config/configuration";
import { compareSemver } from "../core/update-checker";

interface UpdateModalProps {
    visible: boolean;
    updateResult: any;
    theme?: "dark" | "light";
    onClose: () => void;
}

export function UpdateInfoModal({ visible, updateResult, theme = "dark", onClose }: UpdateModalProps) {
    const isLight = theme === "light";

    if (!updateResult) return null;

    // Filter to show only changelog entries strictly newer than current installed version
    const newerChangelogs = Array.isArray(updateResult.changelog)
        ? updateResult.changelog.filter((entry: any) =>
            entry && entry.version ? compareSemver(entry.version, CONFIG.APP_VERSION) > 0 : false
        )
        : [];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/70 justify-center items-center p-5">
                <View
                    className={`w-full max-w-[400px] rounded-3xl p-6 border ${
                        isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                    }`}
                >
                    <View className="items-center mb-4">
                        <View
                            className={`w-15 h-15 rounded-full justify-center items-center mb-3 ${
                                updateResult.isAvailable ? "bg-purple-500/15" : "bg-green-500/15"
                            }`}
                        >
                            {updateResult.isAvailable ? (
                                <Download color="#a855f7" size={28} />
                            ) : (
                                <CheckCircle2 color="#22c55e" size={28} />
                            )}
                        </View>
                        <Text className={`text-[18px] font-bold text-center ${isLight ? "text-slate-900" : "text-white"}`}>
                            {updateResult.isAvailable ? "New Update Available!" : "You're on the Latest Version"}
                        </Text>
                        <Text className={`text-[13px] mt-1 text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                            Current: v{CONFIG.APP_VERSION}{" "}
                            {updateResult.latestVersion ? `• Latest: v${updateResult.latestVersion}` : ""}
                        </Text>
                    </View>

                    {updateResult.isAvailable && newerChangelogs.length > 0 && (
                        <ScrollView className="max-h-[200px] mb-4">
                            <Text className={`text-[11px] font-bold tracking-wider mb-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                WHAT'S NEW
                            </Text>
                            {newerChangelogs.map((entry: any, idx: number) => (
                                <View key={idx} className="mb-3">
                                    <Text className={`text-sm font-semibold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                                        v{entry.version} {entry.title ? `- ${entry.title}` : ""}
                                    </Text>
                                    {entry.changes?.map((change: string, cIdx: number) => (
                                        <Text key={cIdx} className={`text-[13px] leading-5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                                            • {change}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <View className="flex-row gap-2.5">
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                                isLight ? "border-slate-200" : "border-slate-700"
                            }`}
                            onPress={onClose}
                        >
                            <Text className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                                Close
                            </Text>
                        </TouchableOpacity>

                        {updateResult.isAvailable && updateResult.downloadUrl && (
                            <TouchableOpacity
                                className="flex-1 flex-row py-3 rounded-xl items-center justify-center bg-violet-600"
                                onPress={() => {
                                    Linking.openURL(updateResult.downloadUrl).catch((err) => {
                                        console.warn("Could not open download link:", err);
                                    });
                                }}
                            >
                                <Download color="#fff" size={16} style={{ marginRight: 6 }} />
                                <Text className="text-white text-sm font-bold">Download APK</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
