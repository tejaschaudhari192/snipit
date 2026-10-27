import React from "react";
import {
    View,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Cloud, Shield, ChevronRight, Lock, User } from "lucide-react-native";
import { UserAvatar } from "./UserAvatar";
import { UserSession } from "../core/vault-storage";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "./ui/card";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface HubScreenProps {
    theme: "dark" | "light";
    user: UserSession | null;
    onOpenTool: (tool: "pwmg" | "auth" | "profile") => void;
}

export function HubScreen({ theme, user, onOpenTool }: HubScreenProps) {
    const isLight = theme === "light";

    return (
        <SafeAreaView
            className="flex-1 bg-background"
            edges={["top", "bottom", "left", "right"]}
        >
            <ExpoStatusBar style={isLight ? "dark" : "light"} />

            {/* App Header */}
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-border bg-background">
                <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 overflow-hidden rounded-md border border-border">
                        <Image
                            source={require("../../assets/snipit-logo.png")}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </View>
                    <Text className="text-lg font-bold tracking-tight">Snipit</Text>
                </View>

                <View className="flex-row items-center gap-2">
                    {/* Top Sync Status */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 flex-row gap-1.5"
                        onPress={() => onOpenTool(user ? "profile" : "auth")}
                    >
                        <View className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        <Text className="text-xs">{user?.token ? "Synced" : "Local"}</Text>
                    </Button>

                    {/* Profile / Auth Button */}
                    {user ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 flex-row gap-1.5"
                            onPress={() => onOpenTool("profile")}
                        >
                            <UserAvatar uri={user.avatar} name={user.username || "User"} size={22} />
                            <Text className="text-xs font-medium">{user.username}</Text>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="h-8 px-3"
                            onPress={() => onOpenTool("auth")}
                        >
                            <Text className="text-xs font-semibold text-primary-foreground">
                                Sign In
                            </Text>
                        </Button>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1 bg-background" contentContainerClassName="p-5 max-w-lg w-full mx-auto">
                <View className="mb-5">
                    <Text className="text-2xl font-bold tracking-tight mb-1">Select Tool</Text>
                    <Text className="text-sm text-muted-foreground">
                        Direct access to Snipit's privacy-focused tools. Fast local performance with cloud account sync.
                    </Text>
                </View>

                {/* Primary Tool Card with Shadcn Card */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onOpenTool("pwmg")}
                >
                    <Card className="border-border bg-card p-4 flex-row items-center gap-4">
                        <View className="w-12 h-12 rounded-lg bg-muted justify-center items-center">
                            <Shield className="text-foreground" size={24} />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-0.5">
                                <CardTitle className="text-base font-semibold">
                                    Password Manager
                                </CardTitle>
                                <View className="px-1.5 py-0.5 rounded border border-border bg-muted">
                                    <Text className="text-[10px] font-mono font-medium">
                                        E2EE
                                    </Text>
                                </View>
                            </View>
                            <CardDescription className="text-xs leading-4 text-muted-foreground">
                                Zero-knowledge encrypted vault with 12-word recovery key, generator & master password.
                            </CardDescription>
                        </View>
                        <ChevronRight className="text-muted-foreground" size={18} />
                    </Card>
                </TouchableOpacity>

                {/* Security footer */}
                <View className="flex-row items-center justify-center gap-2 mt-12 px-4">
                    <Lock className="text-muted-foreground" size={13} />
                    <Text className="text-xs text-muted-foreground text-center">
                        End-to-end encrypted with XSalsa20-Poly1305. Non-custodial security.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
