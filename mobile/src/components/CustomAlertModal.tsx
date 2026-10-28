import React from "react";
import { View, Modal, TouchableOpacity, Pressable } from "react-native";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Card } from "./ui/card";

export interface CustomAlertButton {
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
}

export interface CustomAlertConfig {
    visible: boolean;
    title: string;
    message?: string;
    type?: "info" | "success" | "warning" | "error";
    buttons?: CustomAlertButton[];
    onDismiss?: () => void;
}

interface CustomAlertModalProps {
    config: CustomAlertConfig;
    theme?: "dark" | "light";
}

export function CustomAlertModal({ config }: CustomAlertModalProps) {
    if (!config.visible) return null;

    const type = config.type || "info";

    const getIconBadge = () => {
        switch (type) {
            case "success":
                return (
                    <View className="w-12 h-12 rounded-full bg-green-500/10 justify-center items-center mb-3">
                        <CheckCircle2 color="#22c55e" size={26} />
                    </View>
                );
            case "error":
                return (
                    <View className="w-12 h-12 rounded-full bg-destructive/15 justify-center items-center mb-3">
                        <AlertCircle color="#ef4444" size={26} />
                    </View>
                );
            case "warning":
                return (
                    <View className="w-12 h-12 rounded-full bg-amber-500/15 justify-center items-center mb-3">
                        <AlertTriangle color="#f59e0b" size={26} />
                    </View>
                );
            case "info":
            default:
                return (
                    <View className="w-12 h-12 rounded-full bg-muted justify-center items-center mb-3">
                        <Info color="#71717a" size={26} />
                    </View>
                );
        }
    };

    const buttons =
        config.buttons && config.buttons.length > 0
            ? config.buttons
            : [{ text: "OK", style: "default" as const, onPress: config.onDismiss }];

    return (
        <Modal
            visible={config.visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={config.onDismiss}
        >
            <Pressable
                className="flex-1 bg-black/60 items-center justify-center p-4"
                onPress={config.onDismiss}
            >
                <Pressable
                    className="w-full max-w-sm"
                    onPress={(e) => e.stopPropagation()}
                >
                    <Card className="border border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-2xl p-6 items-center">
                        {/* Media Icon Badge */}
                        {getIconBadge()}

                        {/* Title */}
                        <Text className="text-center font-bold text-lg text-foreground tracking-tight">
                            {config.title}
                        </Text>

                        {/* Description Message */}
                        {config.message ? (
                            <Text className="text-center text-sm text-muted-foreground mt-2 leading-5">
                                {config.message}
                            </Text>
                        ) : null}

                        {/* Action Buttons Footer */}
                        <View className="flex-row gap-2.5 w-full mt-6">
                            {buttons.map((btn, idx) => {
                                const variant =
                                    btn.style === "destructive"
                                        ? "destructive"
                                        : btn.style === "cancel"
                                        ? "outline"
                                        : "default";

                                return (
                                    <Button
                                        key={idx}
                                        variant={variant}
                                        className="flex-1 h-10"
                                        onPress={() => {
                                            // Close modal immediately without lag or delay
                                            config.onDismiss?.();
                                            // Immediately execute action handler
                                            btn.onPress?.();
                                        }}
                                    >
                                        <Text className="font-semibold">{btn.text}</Text>
                                    </Button>
                                );
                            })}
                        </View>
                    </Card>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
