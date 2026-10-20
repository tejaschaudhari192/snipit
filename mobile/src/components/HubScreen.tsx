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
            className={`flex-1 min-h-screen ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
            style={{
                flex: 1,
                backgroundColor: isLight ? "#f8fafc" : "#020617",
                paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
            }}
        >
            <ExpoStatusBar style={isLight ? "dark" : "light"} />

            {/* App Header */}
            <View
                className={`flex-row justify-between items-center px-4 py-3 border-b ${
                    isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
            >
                <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 overflow-hidden rounded-lg">
                        <Image
                            source={require("../../assets/snipit-logo.png")}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </View>
                    <Text className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                        Snipit
                    </Text>
                </View>

                <View className="flex-row items-center gap-2">
                    {/* Top Sync Status Pill */}
                    <TouchableOpacity
                        className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${
                            isLight
                                ? "bg-slate-100 border-slate-200"
                                : "bg-slate-900 border-slate-800"
                        }`}
                        onPress={() => onOpenTool(user ? "profile" : "auth")}
                        activeOpacity={0.7}
                    >
                        <View
                            className={`w-1.5 h-1.5 rounded-full ${
                                user?.token ? "bg-green-500" : "bg-yellow-500"
                            }`}
                        />
                        <Cloud color={user?.token ? "#3b82f6" : "#eab308"} size={12} />
                        <Text
                            className={`text-[11px] font-bold ${
                                isLight ? "text-slate-600" : "text-slate-400"
                            }`}
                        >
                            {user?.token ? "Synced" : "Local"}
                        </Text>
                    </TouchableOpacity>

                    {/* Profile Button or Sign In Button */}
                    {user ? (
                        <TouchableOpacity
                            className={`flex-row items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border ${
                                isLight
                                    ? "bg-indigo-50 border-indigo-200"
                                    : "bg-violet-950 border-violet-800"
                            }`}
                            onPress={() => onOpenTool("profile")}
                            activeOpacity={0.7}
                        >
                            <UserAvatar
                                uri={user.avatar}
                                name={user.username || "User"}
                                size={26}
                            />
                            <Text
                                className={`text-[13px] font-bold ${
                                    isLight ? "text-indigo-600" : "text-violet-300"
                                }`}
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
                            className="flex-row items-center gap-1.5 bg-violet-600 px-3.5 py-1.5 rounded-full"
                            onPress={() => onOpenTool("auth")}
                            activeOpacity={0.8}
                        >
                            <User color="#fff" size={14} />
                            <Text className="text-white text-[13px] font-bold">Sign In</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
                style={{ backgroundColor: isLight ? "#f8fafc" : "#020617" }}
                contentContainerStyle={{ padding: 20 }}
            >
                {/* Hero Introduction */}
                <View className="mb-5">
                    <Text
                        className={`text-2xl font-extrabold tracking-tight mb-1.5 ${
                            isLight ? "text-slate-900" : "text-slate-100"
                        }`}
                    >
                        Select Tool
                    </Text>
                    <Text
                        className={`text-sm leading-5 ${
                            isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                    >
                        Direct access to Snipit's privacy-focused tools. Fast local performance with cloud account sync.
                    </Text>
                </View>

                {/* Primary Tool Cards */}
                <View className="gap-4">
                    {/* PWMG (Password Manager) Card */}
                    <TouchableOpacity
                        className={`flex-row items-center rounded-2xl p-4 border ${
                            isLight
                                ? "bg-white border-slate-200 shadow-sm"
                                : "bg-slate-900 border-violet-900"
                        }`}
                        activeOpacity={0.8}
                        onPress={() => onOpenTool("pwmg")}
                    >
                        <View
                            className={`w-12 h-12 rounded-xl justify-center items-center mr-4 ${
                                isLight ? "bg-violet-100" : "bg-violet-950"
                            }`}
                        >
                            <Shield color={isLight ? "#7c3aed" : "#a78bfa"} size={26} />
                        </View>
                        <View className="flex-1 mr-2">
                            <View className="flex-row items-center justify-between mb-1">
                                <Text
                                    className={`text-[17px] font-bold ${
                                        isLight ? "text-slate-900" : "text-slate-100"
                                    }`}
                                >
                                    Password Manager
                                </Text>
                                <View
                                    className={`px-1.5 py-0.5 rounded ${
                                        isLight ? "bg-violet-100" : "bg-violet-900"
                                    }`}
                                >
                                    <Text
                                        className={`text-[9px] font-black ${
                                            isLight ? "text-violet-700" : "text-violet-300"
                                        }`}
                                    >
                                        ZERO-KNOWLEDGE
                                    </Text>
                                </View>
                            </View>
                            <Text
                                className={`text-xs leading-4 ${
                                    isLight ? "text-slate-500" : "text-slate-400"
                                }`}
                            >
                                Zero-knowledge encrypted vault with 12-word recovery key, generator & master password.
                            </Text>
                        </View>
                        <ChevronRight color={isLight ? "#7c3aed" : "#a78bfa"} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Security note footer */}
                <View className="flex-row items-center justify-center gap-2 mt-10 px-4">
                    <Lock color={isLight ? "#94a3b8" : "#64748b"} size={14} />
                    <Text
                        className={`text-xs text-center ${
                            isLight ? "text-slate-400" : "text-slate-500"
                        }`}
                    >
                        End-to-end encrypted with XSalsa20-Poly1305. Non-custodial security.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
